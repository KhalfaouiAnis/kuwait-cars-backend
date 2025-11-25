import { Request } from "express";

import BadRequestError from "@libs/error/BadRequestError";
import { toJson } from "@libs/transformer";
import { prisma } from "database";

import { AdInterface, AdModelSchema } from "types/ad";
import { prepareAndUploadVideo } from "@libs/media/edit-video";
import { prepareAndUploadImage } from "@libs/media/edit-image";

export const saveAdFlowOne = async (req: Request) => {
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const data: AdInterface = {
    ...req.body,
    thumbnail: files.thumbnail?.[0],
    images: files.images,
    video: files.video?.[0],
    audio: files.audio?.[0],
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
    thumbnail,
    images,
    video,
    audio,
    category_id,
    plan,
    ...rest
  } = parsedData;

  const category = await prisma.category.findUnique({
    where: { id: category_id },
  });

  if (!category) throw new BadRequestError({ message: "Category not found" });

  // const imagesToPrepare = [thumbnail];

  // if (Array.isArray(images)) {
  //   imagesToPrepare.concat(images);
  // }

  // const imagesToUpload = imagesToPrepare.map(async (image) => {
  //   const result = await prepareAndUploadImage(image);
  //   return result;
  // });

  // const imageUploads = await Promise.all(imagesToUpload);
  const videoToUpload = await prepareAndUploadVideo(video, audio, false);

  console.log({ videoToUpload: videoToUpload?.secure_url });

  return prisma.$transaction(async (tx) => {
    const ad = await tx.ad.create({
      data: {
        description,
        price,
        title,
        plan,
        location: { create: location },
        car: car ? { create: car } : undefined,
        category: { connect: { id: category.id } },
        user: { connect: { id: req.user!.userId } },
        ...rest,
      },
    });

    // if (Array.isArray(imageUploads)) {
    //   const imagesMediaData = imageUploads.map((image) => {
    //     if (image) {
    //       return {
    //         url: image.secure_url,
    //         public_id: image.public_id,
    //         type: image.original_filename.includes("thumbnail")
    //           ? "thumbnail"
    //           : image.resource_type,
    //         ad_id: ad.id,
    //       };
    //     } else {
    //       throw new Error("Invalid image");
    //     }
    //   });

    //   await tx.media.createMany({ data: imagesMediaData });
    // }

    if (videoToUpload) {
      await tx.media.create({
        data: {
          url: videoToUpload.secure_url,
          public_id: videoToUpload.public_id,
          type: videoToUpload.resource_type,
          ad_id: ad.id,
        },
      });
    }

    return ad;
  });
};
