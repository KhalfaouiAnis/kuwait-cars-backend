import { SignApiOptions } from "cloudinary";
import cloudinary from "config/cloudinary.js";
import { CloudinarySignRequestInterface } from "types/cloudinary.js";

export const signCloudinaryRequest = (data: CloudinarySignRequestInterface) => {
  const { mediaType, audioFlag } = data;

  const baseParams: SignApiOptions = {
    timestamp: Math.round(new Date().getTime() / 1000),
  };

  if (mediaType === "image") {
    baseParams.upload_preset = "x_cars_images";
  } else if (mediaType === "video") {
    baseParams.upload_preset = "x_cars_videos";
    if (audioFlag && audioFlag !== "mute") {
      baseParams.eager = `t_video_base/l_audio:${audioFlag}`;
    }
  } else {
    baseParams.upload_preset = "x_cars_avatars";
    baseParams.overwrite = true;
    baseParams.invalidate = true;
  }

  const signature = cloudinary.utils.api_sign_request(
    {
      ...baseParams,
    },
    cloudinary.config().api_secret!
  );

  return {
    signature,
    params: { ...baseParams },
    cloudName: cloudinary.config().cloud_name,
    apiKey: cloudinary.config().api_key,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinary.config().cloud_name}/auto/upload`,
  };
};
