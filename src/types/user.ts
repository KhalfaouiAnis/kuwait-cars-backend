import { UserRole } from "generated/prisma/client.js";
import { AreaSchema, LocationSchema, ProvinceSchema } from "types/index.js";
import z from "zod";

export const LoginSchema = z.object({
  phone: z.string().min(6),
  password: z.string().min(6),
});

export const UpdatePasswordSchema = z.object({
  password: z.string().min(6),
});

export const SignupSchema = z.object({
  fullname: z.string().min(3),
  email: z.email().optional(),
  phone: z.string().min(6).max(15),
  password: z.string().min(6),
  role: z.optional(z.enum(UserRole)),
  province: ProvinceSchema.optional(),
  area: AreaSchema.optional(),
  avatar: z.string().optional(),
});

export const UpdateProfileSchema = z.object({
  fullname: z.string("Name is required").min(3),
  phone: z.string("Phone number is required").min(6).max(15),
  email: z.email().optional(),
  province: ProvinceSchema.optional(),
  area: AreaSchema.optional(),
  location: LocationSchema.optional(),
  avatar: z.string().optional(),
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
export type UpdatePasswordInterface = z.infer<typeof UpdatePasswordSchema>;
export type UpdateProfileInterface = z.infer<typeof UpdateProfileSchema>;
export type RequestResetPasswordInterface = z.infer<
  typeof RequestResetPasswordSchema
>;
export type ResetPasswordInterface = z.infer<typeof ResetPasswordSchema>;
