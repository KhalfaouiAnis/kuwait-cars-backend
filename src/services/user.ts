import BadRequestError from "@libs/error/BadRequestError.js";
import { NOT_FOUND_ERROR } from "@libs/error/error-code.js";
import { prisma } from "database/index.js";
import { Request } from "express";
import { UpdateProfileSchema } from "types/user.js";

export const fetchUsers = async () => {
  return prisma.user.findMany();
};

export const fetchUserDetails = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { ads: { omit: { user_id: true } } },
  });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.delete({ where: { id: userId } });
};

export const updateProfile = async (req: Request) => {
  const userId = req.user?.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new BadRequestError({
      message: "User not found.",
      error_code: NOT_FOUND_ERROR,
    });
  }

  const { success, error, data } = UpdateProfileSchema.safeParse({
    ...req.body,
  });

  if (!success) {
    throw new BadRequestError({
      context: error.issues,
      message: "Bad request",
    });
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    omit: { password: true, created_at: true, updated_at: true },
  });

  return updatedUser;
};
