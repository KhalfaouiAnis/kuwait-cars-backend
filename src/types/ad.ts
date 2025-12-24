import { AdStatus } from "generated/prisma/enums.js";
import {
  AreaSchema,
  LocationSchema,
  MediaModelSchema,
  PlanSchema,
  ProvinceSchema,
} from "types/index.js";
import z from "zod";

export const AdModelSchema = z.object({
  ad_type: z.string(),
  title: z.string().min(3, "The title field is required"),
  description: z.string().min(3, "The description field is required"),
  plan: PlanSchema,
  province: ProvinceSchema,

  media: z.array(MediaModelSchema),

  ad_category: z.string().optional(),
  area: AreaSchema.optional(),
  location: LocationSchema.optional(),
  price: z.coerce.number().optional(),

  year: z.coerce.number().min(0).max(new Date().getFullYear()).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  exterior_color: z.string().optional(),
  mileage: z.coerce.number().optional(),
  mileage_unit: z.string().optional(),

  fuel_type: z.string().optional(),
  cylinders: z.string().optional(),
  transmission: z.string().optional(),
  under_warranty: z.coerce.boolean().optional(),
  roof: z.string().optional(),

  additional_number: z.string().optional(),
  second_additional_number: z.string().optional(),
  hide_license_plate: z.coerce.boolean().optional(),

  contact_whatsapp: z.coerce.boolean().optional(),
  receive_calls: z.coerce.boolean().optional(),
  xcar_calls: z.coerce.boolean().optional(),
  xcar_chat: z.coerce.boolean().optional(),
});

export const AdSearchSchema = z.object({
  pagination: z
    .object({
      limit: z.number().min(1).max(50).default(10),
      cursor: z.nullable(z.string()).optional().default(null),
    })
    .default({ limit: 10, cursor: null }),
  sorting: z
    .object({
      field: z.enum(["price", "created_at"]),
      direction: z.enum(["asc", "desc"]),
    })
    .optional()
    .default({ field: "created_at", direction: "desc" }),
  filters: z
    .object({
      user_id: z.string().optional(),
      ad_type: z.string().optional(),
      is_mine: z.boolean().optional(),
      status: z.enum(AdStatus).optional(),
      title: z.string().optional(),
      year: z.array(z.coerce.number()).optional(),
      price: z.array(z.coerce.number()).min(2).max(2).optional(),
      brand: z.array(z.string()).optional(),
      model: z.array(z.string()).optional(),
      exterior_color: z.array(z.string()).optional(),
      mileage: z.array(z.coerce.number()).min(2).max(2).optional(),
      transmission: z.string().optional(),
    })
    .optional()
    .default({}),
  direction: z.enum(["forward", "backward"]).default("forward").optional(),
});

export type AdSearchInterface = z.infer<typeof AdSearchSchema>;
export type AdInterface = z.infer<typeof AdModelSchema>;
