import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "constatnts";
import { UserRole } from "generated/prisma";
import z from "zod";

export const AvatarSchema = z.object({
  avatar: z
    .custom<Express.Multer.File>((val) => {
      return (
        typeof val === "object" &&
        val !== null &&
        "mimetype" in val &&
        typeof val.mimetype === "string" &&
        val.mimetype?.startsWith("image/") &&
        "size" in val &&
        (val.size as number) <= 5 * 1024 * 1024 // 5MB
      );
    }, "Avatar must be a valid image file under 5MB")
    .refine(
      (file) => file.size <= MAX_IMAGE_SIZE,
      `File size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.mimetype),
      `File must be a supported image format (${ACCEPTED_IMAGE_TYPES.join(",")})`
    ),
});

export const VideoSchema = z.object({
  video: z
    .custom<Express.Multer.File>(
      () => {},
      `Video must be a valid video file under ${MAX_VIDEO_SIZE}MB`
    )
    .refine(
      (file) => file.size <= MAX_VIDEO_SIZE,
      `File size must be less than ${MAX_VIDEO_SIZE / (1024 * 1024)}MB`
    )
    .refine(
      (file) => ACCEPTED_VIDEO_TYPES.includes(file.mimetype),
      `File must be a supported video format (${ACCEPTED_VIDEO_TYPES.join(",")})`
    ),
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  fullname: z.string().min(3),
  email: z.email(),
  phone: z.string().min(6).max(15),
  password: z.string().min(6),
  role: z.optional(z.enum(UserRole)),
  avatar: z.optional(AvatarSchema.shape.avatar),
});

export type SignupInterface = z.infer<typeof SignupSchema>;
export type LoginInterface = z.infer<typeof LoginSchema>;
export type AvatarValidationType = z.infer<typeof AvatarSchema>;

export interface PagingParams {
  page?: string;
  pageSize?: string;
}
