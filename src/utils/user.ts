import BadRequestError from "@libs/error/BadRequestError";
import { prisma } from "database";

export const checkUserExists = async (user_id: string) => {
  const user = await prisma.user.findUnique({ where: { id: user_id } });
  if (!user) throw new BadRequestError({ message: "User not found" });

  return user;
};
