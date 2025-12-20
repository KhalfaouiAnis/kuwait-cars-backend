import { Prisma } from "generated/prisma/client.js";
import { AdSearchInterface } from "types/ad.js";

export interface QueryBuilderInput {
  pagination?: { limit?: number; cursor?: string };
  sorting?: { field: string; direction: "asc" | "desc" };
  filters?: Record<string, any>;
}

export const buildPrismaQuery = (input: AdSearchInterface) => {
  const { pagination, sorting, filters, direction } = input;

  const rawCursor = pagination?.cursor;
  const cursorId =
    rawCursor === null || rawCursor === undefined ? undefined : rawCursor;

  console.log(filters);

  const where: any = {};
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;

      if (key === "ad_type" && value) {
        where.ad_type = filters.ad_type;
      } else if (key === "is_mine" && value) {
        where.user_id = filters.user_id;
      } else if (key === "price" && filters.price) {
        where.price = {
          gte: Prisma.Decimal(filters.price[0]),
          lte: Prisma.Decimal(filters.price[1]),
        };
      } else if (key === "mileage" && filters.mileage) {
        where.mileage = {
          gte: Prisma.Decimal(filters.mileage[0]),
          lte: Prisma.Decimal(filters.mileage[1]),
        };
      } else if (key === "brand" && filters.brand) {
        where.brand = { in: filters.brand, mode: "insensitive" };
      } else if (key === "model" && filters.model) {
        where.model = { in: filters.model, mode: "insensitive" };
      } else if (key === "exterior_color" && filters.exterior_color) {
        where.exterior_color = {
          in: filters.exterior_color,
          mode: "insensitive",
        };
      } else if (key === "year" && filters.year) {
        where.year = { in: filters.year };
      } else if (typeof value === "string") {
        where[key] = { contains: value, mode: "insensitive" };
      } else {
        where[key] = value;
      }
    });
  }

  // Index for Price-based sorting
  // @@index([planRank, price, id])
  // Index for Date-based sorting
  // @@index([planRank, created_at, id])
  // const orderBy: Prisma.AdOrderByWithRelationInput[] = [
  //   { planRank: "asc" },
  //   { [sorting.field || created_at]: sorting.direction || 'desc' },
  //   { id: "asc" },
  // ];

  const orderBy: any[] = [
    {
      [sorting?.field || "created_at"]:
        (direction === "forward" ? "asc" : sorting?.direction) || "desc",
    },
    { id: direction === "forward" ? "asc" : ("desc" as const) },
  ];

  if (sorting?.field) {
    orderBy.unshift({
      [sorting.field]: direction === "forward" ? "asc" : sorting.direction,
    });
  }

  const take = (pagination?.limit || 10) + 1;
  const cursor = cursorId ? { id: cursorId } : undefined;
  const skip = cursorId ? 1 : 0;

  return { where, orderBy, take, skip, cursor };
};

// if (filters.brand) {
//   where.brand = {};
//   where.brand = { contains: filters.brand, mode: "insensitive" };
// }

// if (filters.model) {
//   where.model = {};
//   where.model = { contains: filters.model, mode: "insensitive" };
// }

// if (filters.transmission) {
//   where.transmission = {};
//   where.transmission = {
//     contains: filters.transmission,
//     mode: "insensitive",
//   };
// }

// if (filters.exterior_color) {
//   where.exterior_color = {};
//   where.exterior_color = {
//     contains: filters.exterior_color,
//     mode: "insensitive",
//   };
// }
