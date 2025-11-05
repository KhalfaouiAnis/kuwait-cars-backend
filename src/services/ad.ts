import BadRequestError from "@libs/error/BadRequestError";
import { BAD_REQUEST_ERROR, SERVER_ERROR } from "@libs/error/error-code";
import ServerError from "@libs/error/ServerError";
import { buildAdFilters } from "@libs/filters/query-filter";
import { toJson } from "@libs/transformer";
import { checkUserExists } from "@utils/user";
import { ADS_PAGE_SIZE } from "constatnts";
import { prisma } from "database";
import { Request } from "express";
import { AdFiltersSchema, AdInterface, AdModelSchema } from "types/ad";
import z from "zod";

export const saveAd = async (req: Request) => {
  const user = await checkUserExists(req.user!.userId);

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const data: AdInterface = {
    ...req.body,
    thambnail_image: files.thambnail?.[0] || undefined,
    images: files.images || [],
    video: files.video[0],
    location: toJson(req.body.location),
    car: req.body.car ? toJson(req.body.car) : undefined,
  };

  const validated = AdModelSchema.safeParse(data);

  if (!validated.success) {
    console.log("Zod errors:", validated.error.issues);
    throw new BadRequestError();
  }

  const parsedData = validated.data;

  const {
    description,
    price,
    title,
    year,
    car,
    location,
    images,
    thambnail_image,
    video,
    category_id,
    subcategory_id,
  } = parsedData;

  const category = await prisma.category.findUnique({
    where: { id: category_id },
  });

  if (!category) throw new BadRequestError({ message: "Category not found" });

  const subcategory = await prisma.subcategory.findUnique({
    where: { id: subcategory_id },
  });

  if (!subcategory)
    throw new BadRequestError({ message: "Subcategory not found" });

  await prisma.$transaction(async (tx) => {
    const thambnail_url = `/uploads/images/${thambnail_image.filename}`;

    const ad = await tx.ad.create({
      data: {
        description,
        price,
        title,
        year,
        thambnail_url,
        location: { create: location },
        car: car ? { create: car } : undefined,
        category: { connect: { id: category.id } },
        subcategory: { connect: { id: subcategory.id } },
        user: { connect: { id: user.id } },
      },
    });

    if (Array.isArray(images)) {
      const imagesMediaData = images.map((file) => ({
        url: `/uploads/${file.filename}`,
        type: "image",
        file_name: file.originalname,
        ad_id: ad.id,
      }));

      await tx.media.createMany({ data: imagesMediaData });
    }

    const videoMediaData = {
      url: `/uploads/${video.filename}`,
      type: "video",
      file_name: video.originalname,
      ad_id: ad.id,
    };

    await tx.media.create({ data: videoMediaData });

    return ad;
  });
};

export const fetchAds = async (req: Request) => {
  try {
    const { cursor, limit = ADS_PAGE_SIZE } = req.query;
    const filters = AdFiltersSchema.parse(req.body);

    const { where, orderBy, take } = buildAdFilters(
      filters,
      cursor ? (cursor as string) : undefined,
      parseInt(limit as string)
    );

    const [ads, total] = await prisma.$transaction([
      prisma.ad.findMany({
        ...{ where, orderBy, take },
        include: { car: { select: { model: true } } },
      }),
      prisma.ad.count({ where }),
    ]);

    const hasMore = ads.length > parseInt(limit as string);
    const nextCursor = hasMore
      ? encodeURIComponent(JSON.stringify(ads[ads.length - 1]))
      : null;
    const paginatedAds = hasMore ? ads.slice(0, -1) : ads;

    return {
      data: paginatedAds,
      pagination: {
        hasMore,
        nextCursor,
        total,
        limit: parseInt(limit as string),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new BadRequestError({
        error_code: BAD_REQUEST_ERROR,
        message: "Invalid filters",
        context: error.issues.flat(),
      });
    }
    console.error("Query error:", error);
    throw new ServerError({
      error_code: SERVER_ERROR,
      message: "Unable to construct filters and fetch data",
    });
  }
};
