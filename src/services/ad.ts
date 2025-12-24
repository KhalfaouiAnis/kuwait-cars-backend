import cloudinary from "config/cloudinary.js";
import { prisma } from "database/index.js";

import { PaginatedResponse } from "types/index.js";
import { AdInterface, AdSearchInterface } from "types/ad.js";
import { buildPrismaQuery } from "@utils/prisma-query-builder";
import { Ad } from "generated/prisma/client.js";
import {
  buildSelectClose,
  formatAdInteractions,
} from "@utils/prisma-relation-builder";

export const createAd = async (id: string, data: AdInterface) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: { id: true },
  });

  const { media, ...adData } = data;

  const mediaArray = media.map(
    ({ media_type, original_url, transformed_url, public_id }) => ({
      public_id,
      media_type,
      original_url,
      transformed_url,
    })
  );

  const select = buildSelectClose();

  const ad = await prisma.ad.create({
    data: {
      ...adData,
      user: { connect: { id: user.id } },
      media: {
        createMany: {
          data: mediaArray,
        },
      },
    },
    select,
  });

  return ad;
};

export const fetchAds = async (
  input: AdSearchInterface,
  userId: string | undefined
): Promise<Omit<PaginatedResponse<Ad>, "status">> => {
  const queryArgs = buildPrismaQuery(input);
  const select = buildSelectClose(userId);

  const [rawAds, totalCount] = await prisma.$transaction([
    prisma.ad.findMany({ ...queryArgs, select }),
    prisma.ad.count({ where: queryArgs.where }),
  ]);

  const limit = input.pagination?.limit || 10;
  const hasNextPage = rawAds.length > limit;
  const nextCursor = hasNextPage ? rawAds.pop()?.id : null;

  const formattedData = formatAdInteractions(rawAds);

  return {
    data: formattedData,
    meta: { nextCursor, hasNextPage, totalCount },
  };
};

export const fetchUserAds = async (user_id: string) => {
  const select = buildSelectClose(user_id);

  return prisma.ad.findMany({
    where: { user_id },
    select,
  });
};

export const fetchAdDetails = async (id: string, user_id: string) => {
  const select = buildSelectClose(user_id, true);

  const rawAd = prisma.ad.findUniqueOrThrow({
    where: { id },
    select,
  });

  return formatAdInteractions(rawAd);
};

export const deleteAd = async (id: string, user_id: string) => {
  const ad = await prisma.ad.findUniqueOrThrow({
    where: { id, user_id },
    select: {
      user_id: true,
      media: {
        select: {
          original_url: true,
          transformed_url: true,
          media_type: true,
          public_id: true,
        },
      },
    },
  });

  await prisma.$transaction(async (tx) => {
    await tx.media.deleteMany({ where: { ad_id: id } });
    await tx.ad.delete({ where: { id } });

    ad.media.forEach((media) => cloudinary.uploader.destroy(media.public_id));
  });
};

export const softDeleteAd = async (id: string, user_id: string) => {
  const ad = await prisma.ad.findUnique({
    where: { id, user_id },
    select: {
      user_id: true,
      created_at: true,
      media: {
        select: {
          original_url: true,
          transformed_url: true,
          media_type: true,
          public_id: true,
        },
      },
    },
  });

  await prisma.ad.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
};

export const toggleFavoriteAd = async (user_id: string, id: string) => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.ad.findFirst({
      where: { id, favorited_by: { some: { id: user_id } } },
      select: { id: true },
    });

    if (existing) {
      return tx.ad.update({
        where: { id },
        data: { favorited_by: { disconnect: [{ id: user_id }] } },
      });
    }

    return tx.ad.update({
      where: { id },
      data: { favorited_by: { connect: [{ id: user_id }] } },
    });
  });
};

export const flagAd = async (user_id: string, id: string) => {
  return prisma.ad.update({
    where: { id },
    data: { flagged_by: { connect: [{ id: user_id }] } },
    select: {
      id: true,
      flagged_by: {
        select: { fullname: true, id: true },
      },
    },
  });
};

export const getAdsByIds = async (ids: string[], userId: string) => {
  const ads = await prisma.ad.findMany({
    where: {
      id: { in: ids },
    },
    select: {
      id: true,
      title: true,
      description: true,
      favorited_by: {
        where: { id: userId },
        select: {
          id: true,
        },
        take: 1,
      },
      media: {
        where: { media_type: { equals: "THUMBNAIL" } },
        select: { transformed_url: true },
      },
    },
  });

  return ads.map((ad) => ({
    ...ad,
    is_favorited: ad.favorited_by.length > 0,
  }));
};

export const getUserFavoritedAds = async (userId: string) => {
  const select = buildSelectClose(userId);

  const ads = await prisma.ad.findMany({
    where: {
      favorited_by: { some: { id: userId } },
    },
    select,
  });

  return ads.map((ad) => ({
    ...ad,
    is_favorited: ad.favorited_by.length > 0,
  }));
};
