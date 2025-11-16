import { prisma } from "database";
import { Request, Response } from "express";

export const listCategories = async (_: Request, res: Response) => {
  const categoris = await prisma.category.findMany();
  res.json(categoris);
};
