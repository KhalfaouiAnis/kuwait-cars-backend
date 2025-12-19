import { prisma } from "database/index.js";
import { Request } from "express";
import { UpdateProfileInterface } from "types/user";

export const fetchUsers = async () => {
  return prisma.user.findMany();
};

export const fetchUserDetails = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: { password: true, created_at: true, updated_at: true },
    include: { ads: { omit: { user_id: true } } },
  });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.delete({ where: { id: userId } });
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInterface
) => {
  return prisma.user.update({
    where: { id: userId },
    data,
    omit: { password: true, created_at: true, updated_at: true },
  });
};
