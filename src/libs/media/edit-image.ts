import { unlinkFile } from "@utils/upload";
import cloudinary from "config/cloudinary";

export async function prepareAndUploadImage(image?: Express.Multer.File) {
  if (!image) throw new Error("Image is required");

  const filePath = image.path;
  const isJpeg =
    image.mimetype === "image/jpeg" || image.mimetype === "image/jpg";

  try {
    const uploadOptions: any = {
      resource_type: "image",
      folder: "x_cars/images",
      transformation: [
        ...(isJpeg ? [{ format: "jpg", background: "white" }] : [{}]),
        {
          width: 1080,
          height: 608,
          crop: "pad",
          background: "gen_fill",
        },
        {
          effect: "screen",
          overlay: "x_cars_logo",
          gravity: "south_west",
          y: 20,
          x: 20,
        },
      ],
    };

    uploadOptions.transformation.push();

    const result = await cloudinary.uploader.upload(filePath, uploadOptions);

    unlinkFile(filePath);

    return result;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    unlinkFile(filePath);
  }
}

export const uploadImages = (images: Express.Multer.File[]) =>
  images.map((image) => {
    return async () => {
      const result = await prepareAndUploadImage(image);
      return result;
    };
  });
