import { prisma } from "database/index.js";

export const checkUserExists = async (user_id: string) => {
  return prisma.user.findUniqueOrThrow({ where: { id: user_id } });
};
