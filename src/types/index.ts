import { MediaType } from "generated/prisma/enums.js";
import z from "zod";

export const LocationSchema = z.object({
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export const AreaSchema = z.object({
  area: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export const ProvinceSchema = z.object({
  province: z.string(),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

export const MediaModelSchema = z.object({
  public_id: z.string(),
  media_type: z.enum(MediaType),
  original_url: z.string(),
  transformed_url: z.string().optional(),
});

export const PlanSchema = z.object({
  type: z.string(),
  title: z.string(),
  price: z.coerce.number(),
  expires_in: z.coerce.number(),
  features: z.array(z.string()),
});

export interface PaginatedResponse<T> {
  status: "success";
  data: T[];
  meta: {
    nextCursor: string | undefined | null;
    hasNextPage: boolean;
    totalCount: number;
  };
}

export type LocationInterface = z.infer<typeof LocationSchema>;
