import { Prisma } from "generated/prisma";

export const buildAdFilters = (filters: any, cursor?: string, limit = 20) => {
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
    { created_at: "desc" },
    { id: "desc" },
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

  return { where: { ...where, ...cursorCondition }, orderBy, take: limit + 1 };
};
