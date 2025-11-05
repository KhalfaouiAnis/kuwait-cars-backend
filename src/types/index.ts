import {
  ACCEPTED_IMAGE_TYPES,
  ACCEPTED_VIDEO_TYPES,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
} from "constatnts";
import { UserRole } from "generated/prisma";
import z from "zod";

export const FileSchema = z
  .custom<Express.Multer.File>((val) => {
    const typedValue = val as Express.Multer.File;

    return (
      (typedValue !== undefined && typedValue.mimetype.startsWith("image/")) ||
      typedValue.mimetype.startsWith("video/")
    );
  }, "Only image or video files are supported.")
  .refine(
    (file) => file.size <= MAX_IMAGE_SIZE && file.size <= MAX_VIDEO_SIZE,
    `File size must be less than ${MAX_IMAGE_SIZE / (1024 * 1024)}MB for image and ${MAX_VIDEO_SIZE / (1024 * 1024)}MB for video`
  )
  .refine(
    (file) =>
      [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].includes(
        file.mimetype
      ),
    `File must be a supported format (${[...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES].join(",")})`
  );

export const LoginSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  fullname: z.string().min(3),
  email: z.email(),
  phone: z.string().min(6).max(15),
  password: z.string().min(6),
  role: z.optional(z.enum(UserRole)),
  avatar: FileSchema.optional(),
});

export const RequestResetPasswordSchema = z.object({
  email: z.optional(SignupSchema.shape.email),
  phone: z.optional(SignupSchema.shape.phone),
});

export const ResetPasswordSchema = z.object({
  identifier: z.string().min(1),
  otp: z.string().min(4),
  newPassword: SignupSchema.shape.password,
});

export type SignupInterface = z.infer<typeof SignupSchema>;
export type LoginInterface = z.infer<typeof LoginSchema>;
export type AvatarValidationType = z.infer<typeof FileSchema>;
export type RequestResetPasswordInterface = z.infer<
  typeof RequestResetPasswordSchema
>;
export type ResetPasswordInterface = z.infer<typeof ResetPasswordSchema>;

export interface PagingParams {
  page?: string;
  pageSize?: string;
}
