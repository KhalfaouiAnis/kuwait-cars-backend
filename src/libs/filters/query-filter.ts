import { ADS_PAGE_SIZE } from "constatnts.js";
import { Prisma } from "generated/prisma/client.js";
import { CursorPaginationQuery } from "types/index.js";
import { AdFiltersInterface } from "types/ad.js";

type FiltersParams = CursorPaginationQuery & {
  filters: AdFiltersInterface;
};

export const buildAdFilters = (params: FiltersParams) => {
  const { filters, cursor, limit = ADS_PAGE_SIZE, direction } = params;

  const where: Prisma.AdWhereInput = {};

  if (filters.title) {
    where.title = { contains: filters.title, mode: "insensitive" };
  }

  if (filters.price) {
    where.price = {};
    where.price.gte = filters.price[0];
    where.price.lte = filters.price[1];
  }

  // if (filters.location) {
  //   where.location = {};
  // }

  if (filters.brand) {
    where.brand = {};
    where.brand = { contains: filters.brand, mode: "insensitive" };
  }

  if (filters.model) {
    where.model = {};
    where.model = { contains: filters.model, mode: "insensitive" };
  }

  if (filters.transmission) {
    where.transmission = {};
    where.transmission = {
      contains: filters.transmission,
      mode: "insensitive",
    };
  }

  if (filters.exterior_color) {
    where.exterior_color = {};
    where.exterior_color = {
      contains: filters.exterior_color,
      mode: "insensitive",
    };
  }

  // if (filters.search) {
  //   where.OR = [
  //     { title: { contains: filters.search, mode: "insensitive" } },
  //     { description: { contains: filters.search, mode: "insensitive" } },
  //   ];
  // }

  const orderBy: Prisma.AdOrderByWithRelationInput[] = [
    { created_at: direction === "forward" ? "asc" : "desc" },
    { id: direction === "forward" ? "asc" : "desc" },
  ];

  let cursorCondition: Prisma.AdWhereInput = {};

  if (cursor) {
    const cursorData = JSON.parse(decodeURIComponent(cursor));
    cursorCondition = {
      OR: [
        { created_at: { lt: cursorData.created_at } },
        {
          created_at: { equals: cursorData.created_at },
          id: { lt: cursorData.id },
        },
      ],
    };
  }

  return {
    where: { ...where, ...cursorCondition },
    orderBy,
    take: parseInt(limit + 1),
  };
};
