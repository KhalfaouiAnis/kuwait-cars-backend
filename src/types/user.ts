import { UserRole } from "generated/prisma";
import { FileSchema } from "types";
import z from "zod";

export const LoginSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  fullname: z.string().min(3),
  email: z.email(),
  phone: z.string().min(6).max(15),
  password: z.string().min(6),
  role: z.enum(UserRole).optional(),
  city: z.string().optional(),
  zip_code: z.string().optional(),
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

export const UpdateProfileSchema = SignupSchema.partial().extend({
  province: z.string().optional(),
  avatar: FileSchema.optional(),
});

export type SignupInterface = z.infer<typeof SignupSchema>;
export type LoginInterface = z.infer<typeof LoginSchema>;
export type AvatarValidationType = z.infer<typeof FileSchema>;
export type RequestResetPasswordInterface = z.infer<
  typeof RequestResetPasswordSchema
>;
export type ResetPasswordInterface = z.infer<typeof ResetPasswordSchema>;
