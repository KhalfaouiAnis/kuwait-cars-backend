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
  transformed_url: z.string(),
});

export const PlanSchema = z.object({
  type: z.string(),
  title: z.string(),
  price: z.coerce.number(),
  durationInDays: z.coerce.number(),
  features: z.array(z.string()),
});

export interface PagingParams {
  page?: string;
  pageSize?: string;
}

export interface CursorPaginationQuery {
  limit?: string;
  cursor?: string;
  direction?: "forward" | "backward";
}
