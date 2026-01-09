import { prisma } from "database/index.js";
import { Prisma } from "generated/prisma/client.js";
import { UpdateProfileInterface } from "types/user.js";

export const fetchUsers = async () => {
  return prisma.user.findMany();
};

export const fetchUserDetails = async (userId: string) => {
  return prisma.user.findUniqueOrThrow({
    where: { id: userId },
    omit: {
      password: true,
      created_at: true,
      updated_at: true,
      apple_id: true,
      google_id: true,
      facebook_id: true,
    },
  });
};

export const deleteUser = async (userId: string) => {
  return prisma.user.delete({ where: { id: userId } });
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInterface
) => {
  const { avatar, area, location, ...profileData } = data;

  return prisma.user.update({
    where: { id: userId },
    data: {
      ...profileData,
      area: !area ? Prisma.DbNull : area,
      location: !location ? Prisma.DbNull : location,
      avatar: avatar
        ? {
            upsert: {
              create: avatar,
              update: avatar,
            },
          }
        : undefined,
    },
    omit: { password: true, created_at: true, updated_at: true, role: true },
    include: { avatar: { select: { original_url: true, public_id: true } } },
  });
};
