import { FileSchema } from "types";
import z from "zod";

export const CarModelSchema = z.object({
  brand: z.string(),
  mark: z.string(),
  exterior_color: z.string().min(3),
  mileage: z.string(),
  year: z.coerce.number().min(0).max(new Date().getFullYear()),

  fuel_type: z.string().optional(),
  cylinders: z.string().optional(),
  transmission: z.string().optional(),
  under_warranty: z.coerce.boolean().optional(),
  roof: z.string().optional(),
});

export const LocationModelSchema = z.object({
  district: z.string(),
  area: z.string(),
  block: z.string(),
});

export const MediaModelSchema = z.object({
  url: z.string(),
  type: z.string(),
  file_name: z.string(),
});

export const AdModelSchema = z.object({
  title: z.string(),
  description: z.string(),
  location: LocationModelSchema,
  category_id: z.string(),

  price: z.coerce.number().optional(),
  province: z.string().optional(),
  zip_code: z.string().optional(),

  thumbnail: FileSchema,
  images: z.array(FileSchema),
  video: FileSchema,

  car: CarModelSchema.optional(),

  additional_number: z.string().optional(),
  contact_whatsapp: z.coerce.boolean().optional(),
  receive_calls: z.coerce.boolean().optional(),
  xcar_calls: z.coerce.boolean().optional(),
  xcar_chat: z.coerce.boolean().optional(),

  plan: z.string(),
});

export const AdFiltersSchema = z.object({
  title: z.string().optional(),
  year: z.coerce.number().optional(),
  price: z.array(z.number()).optional(),
  model: z.string().optional(),
});

export type AdInterface = z.infer<typeof AdModelSchema>;
export type AdFiltersInterface = z.infer<typeof AdFiltersSchema>;
