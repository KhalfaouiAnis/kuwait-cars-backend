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
  media: z.array(MediaModelSchema),
  plan: PlanSchema,

  is_paid: z.boolean().optional(),
  is_free: z.boolean().optional(),
  ad_category: z.string().optional(),
  area: AreaSchema.optional(),
  province: ProvinceSchema.optional(),
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

export const AdDraftInputSchema = z.object({
  ad_type: z.string(),
  step_index: z.coerce.number().int().min(0),
  content: z.record(z.string(), z.any())
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
      year: z.array(z.coerce.number()).optional(),
      brand: z.array(z.string()).optional(),
      model: z.array(z.string()).optional(),
      price: z.array(z.coerce.number()).min(2).max(2).optional(),
      province: z.string().optional(),
      area: z.string().optional(),
      cylinders: z.array(z.coerce.number()).min(2).max(2).optional(),
      transmission: z.string().optional(),
      under_warranty: z.boolean().optional(),
      fuel_type: z.string().optional(),
      mileage: z.array(z.coerce.number()).min(2).max(2).optional(),
      exterior_color: z.array(z.string()).optional(),
      status: z.enum(AdStatus).optional(),
      title: z.string().optional(),
    })
    .optional()
    .default({}),
  direction: z.enum(["forward", "backward"]).default("forward").optional(),
});

export const PaymentObjectSchema = z.object({
  amount: z.object({
    currency: z.enum(["KWD"]),
    value: z.coerce.number(),
  }),
  language: z.enum(["en", "ar"]).optional(),
  urls: z.object({ successUrl: z.string(), errorUrl: z.string() }).optional(),
  customer: z.optional(
    z.object({
      fullName: z.string().optional(),
      phoneNumber: z.string().optional(),
    }),
  ),
  description: z.string().optional(),
  order: z
    .object({
      ref: z.string().optional(),
      placedAt: z.date(),
      products: z.array(
        z.object({
          nameEn: z.string(),
          nameAr: z.string(),
          qty: z.coerce.number(),
          price: z.coerce.number(),
        }),
      ),
    })
    .optional(),
});

export type PaymentObjectInterface = z.infer<typeof PaymentObjectSchema>;
export type AdSearchInterface = z.infer<typeof AdSearchSchema>;
export type AdInterface = z.infer<typeof AdModelSchema>;
export type AdDraftInput = z.infer<typeof AdDraftInputSchema>;
