import BadRequestError from "@libs/error/BadRequestError.js";
import { prisma } from "database/index.js";

export const checkUserExists = async (user_id: string) => {
  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user) throw new BadRequestError({ message: "User not found" });

  return user;
};
