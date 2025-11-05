import { prisma } from "database";
import { Request, Response } from "express";

export const listCategories = async (_: Request, res: Response) => {
  const categoris = await prisma.category.findMany();
  res.json(categoris);
};

export const listSubCategoriesByCategoryId = async (category_id: string) => {
  return prisma.subcategory.findMany({ where: { category_id } });
};
