import BadRequestError from "@libs/error/BadRequestError";
import { NOT_FOUND_ERROR } from "@libs/error/error-code";
import { prisma } from "database";
import { Request } from "express";
import fs from "fs";
import path from "path";
import { FileSchema } from "types";
import { UpdateProfileSchema } from "types/user";
import { hashPassword } from "./auth";
import { User } from "generated/prisma";

export const fetchUsers = async () => {
  return prisma.user.findMany();
};

export const fetchUserDetails = async (userId: string) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.delete({ where: { id: userId } });
};

export const updateProfile = async (req: Request) => {
  const userId = req.user?.userId;
  const avatar = req.file;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (!user) {
    throw new BadRequestError({
      message: "User not found.",
      error_code: NOT_FOUND_ERROR,
    });
  }

  const { success, error, data } = UpdateProfileSchema.safeParse({
    ...req.body,
    avatar,
  });

  if (!success) {
    throw new BadRequestError({ context: error.issues });
  }

  const { avatar: newAvatar, ...rest } = data;

  const userData: Partial<User> = {
    ...user,
    ...rest,
  };

  if (data.password) {
    userData.password = await hashPassword(data.password);
  }

  if (data.avatar) {
    userData.avatar = `/uploads/images/${data.avatar.filename}`;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: userData,
    omit: { password: true, created_at: true, updated_at: true },
  });

  if (updatedUser.avatar && user.avatar && newAvatar) {
    // TODO: replace file in cloudinary
  }

  return updatedUser;
};

export const updateAvatar = async (
  userId: string,
  file?: Express.Multer.File
) => {
  if (!file) throw new Error("Image file required");

  FileSchema.parse(file);

  const newAvatarUrl = `/uploads/images/${file.filename}`;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (!currentUser) {
    throw new Error("User not found");
  }

  const oldFilePath = currentUser.avatar
    ? path.join(process.cwd(), currentUser.avatar)
    : null;

  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: newAvatarUrl },
    select: { id: true, avatar: true },
  });

  if (oldFilePath) {
    try {
      fs.unlink(oldFilePath, (err) => {
        if (err) throw err;
      });
    } catch (deleteError) {
      console.error(`Failed to delete old avatar ${oldFilePath}:`, deleteError);
    }
  }

  return user;
};
