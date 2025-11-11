import { ADS_PAGE_SIZE } from "constatnts";
import { Prisma } from "generated/prisma";
import { CursorPaginationQuery } from "types";

type FiltersParams = CursorPaginationQuery & {
  filters: any;
};

export const buildAdFilters = (params: FiltersParams) => {
  const { filters, cursor, limit = ADS_PAGE_SIZE, direction } = params;

  const where: Prisma.AdWhereInput = {};

  if (filters.title)
    where.title = { contains: filters.name, mode: "insensitive" };
  if (filters.year) where.year = parseInt(filters.year);

  if (filters.price) {
    where.price = {};
    where.price.gte = parseFloat(filters.price[0]);
    where.price.lte = parseFloat(filters.price[1]);
  }

  if (filters.location) {
    where.location = {
      district: { contains: filters.location, mode: "insensitive" },
    };
  }

  if (filters.model) {
    where.car = {};
    where.car.model = { contains: filters.carModel, mode: "insensitive" };
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }

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

  return { where: { ...where, ...cursorCondition }, orderBy, take: parseInt(limit + 1) };
};
