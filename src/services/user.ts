import { prisma } from 'database';
import fs from 'fs';
import path from 'path';
import { AvatarSchema } from 'types';

export const fetchUsers = async () => {
  return prisma.user.findMany();
};

export const fetchUserDetails = async (userId: string) => {
  return prisma.user.findUnique({ where: { id: userId } });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.delete({ where: { id: userId } });
};

export const updateAvatar = async (
  userId: string,
  file?: Express.Multer.File,
) => {
  if (!file) throw new Error('Image file required');

  AvatarSchema.parse(file);

  const newAvatarUrl = `/uploads/images/${file.filename}`;

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar: true },
  });

  if (!currentUser) {
    throw new Error('User not found');
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
