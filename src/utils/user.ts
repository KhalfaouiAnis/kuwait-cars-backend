import { prisma } from "database/index.js";

export const checkUserExists = async (user_id: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: user_id } });
  return user;
};
