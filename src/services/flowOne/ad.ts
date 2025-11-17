import { Request } from "express";

import BadRequestError from "@libs/error/BadRequestError";
import { toJson } from "@libs/transformer";
import { prisma } from "database";

import { AdInterface, AdModelSchema } from "types/ad";
import { editVideo } from "@libs/media/edit-video";
import { editImage, frextendImage } from "@libs/media/edit-image";

export const saveAdFlowOne = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const data: AdInterface = {
    ...req.body,
    thumbnail: files.thumbnail?.[0],
    images: files.images,
    video: files.video[0],
    location: toJson(req.body.location),
    car: toJson(req.body.car),
  };

  const validated = AdModelSchema.safeParse(data);

  if (!validated.success) {
    throw new BadRequestError({ context: validated.error.issues });
  }

  const parsedData = validated.data;

  const {
    description,
    price,
    title,
    car,
    location,
    images,
    thumbnail,
    video,
    audio,
    category_id,
    plan,
    ...rest
  } = parsedData;

  // const category = await prisma.category.findUnique({
  //   where: { id: category_id },
  // });

  // if (!category) throw new BadRequestError({ message: "Category not found" });
  // await editImage(thumbnail);
  // await editVideo(video, audio, false);
  await frextendImage(thumbnail);

  // return prisma.$transaction(async (tx) => {
  //   const thumbnail_url = `/uploads/images/${thumbnail.filename}`;

  //   const ad = await tx.ad.create({
  //     data: {
  //       description,
  //       price,
  //       title,
  //       plan,
  //       thumbnail: thumbnail_url,
  //       location: { create: location },
  //       car: car ? { create: car } : undefined,
  //       category: { connect: { id: category.id } },
  //       user: { connect: { id: req.user!.userId } },
  //       ...rest,
  //     },
  //   });

  //   if (Array.isArray(images)) {
  //     const imagesMediaData = images.map((file) => ({
  //       url: `/uploads/images/${file.filename}`,
  //       type: "image",
  //       file_name: file.originalname,
  //       ad_id: ad.id,
  //     }));

  //     await tx.media.createMany({ data: imagesMediaData });
  //   }

  //   const videoMediaData = {
  //     url: `/uploads/videos/${video.filename}`,
  //     type: "video",
  //     file_name: video.originalname,
  //     ad_id: ad.id,
  //   };

  //   await tx.media.create({ data: videoMediaData });

  //   return ad;
  // });
};
