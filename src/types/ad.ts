import { FileSchema } from "types";
import z from "zod";

export const CarModelSchema = z.object({
  mileage: z.string(),
  exterior_color: z.string().min(3),
  model: z.string().optional(),
  body_type: z.string().optional(),
  fuel_type: z.string().optional(),
  interior_color: z.string().optional(),
  seats_material: z.string().optional(),
  body_condition: z.string().optional(),
  cylinders: z.string().optional(),
  transmission: z.string().optional(),
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
  year: z.coerce.number().min(0).max(2050),
  price: z.coerce.number(),
  category_id: z.string(),
  subcategory_id: z.string(),
  location: LocationModelSchema,
  thambnail_image: FileSchema,
  images: z.array(FileSchema),
  video: FileSchema,
  additional_number: z.string().optional(),
  car: CarModelSchema.optional(),
  plan: z.string(),
});

export const AdFiltersSchema = z.object({
  title: z.string().optional(),
  year: z.string().optional(),
  price: z.array(z.number()).optional(),
  model: z.string().optional(),
});

export type AdInterface = z.infer<typeof AdModelSchema>;
export type AdFiltersInterface = z.infer<typeof AdFiltersSchema>;
