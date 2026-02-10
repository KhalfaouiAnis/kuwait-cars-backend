import cloudinary from "config/cloudinary.js";
import { prisma } from "database/index.js";

import { PaginatedResponse } from "types/index.js";
import { AdDraftInput, AdInterface, AdSearchInterface } from "types/ad.js";
import { buildPrismaQuery } from "@utils/prisma-query-builder.js";
import { Ad, AdStatus } from "generated/prisma/client.js";
import {
  buildSelectClose,
  formatAdInteractions,
} from "@utils/prisma-relation-builder.js";
import { BadRequestError } from "@libs/error/BadRequestError.js";
import { config } from "@config/environment.js";

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
    }),
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

export const repostAd = async (id: string) => {
  return prisma.ad.update({
    where: { id, status: "COMPLETED", deleted_at: null },
    data: { status: "ACTIVE" },
  });
};

export const fetchAds = async (
  input: AdSearchInterface,
  userId: string | undefined,
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

export const fetchUserAds = async (user_id: string, status: AdStatus) => {
  const select = buildSelectClose(user_id);

  return prisma.ad.findMany({
    select,
    where: { user_id, status },
    orderBy: { created_at: "desc" },
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
  return prisma.ad.update({
    where: { id, user_id },
    data: {
      deleted_at: new Date(),
      status: "COMPLETED",
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
        data: { favorited_by: { disconnect: { id: user_id } } },
      });
    }

    return tx.ad.update({
      where: { id },
      data: { favorited_by: { connect: { id: user_id } } },
    });
  });
};

export const flagAd = async (user_id: string, id: string) => {
  return prisma.ad.update({
    where: { id },
    data: { flagged_by: { connect: { id: user_id } } },
    select: {
      id: true,
      flagged_by: {
        select: { fullname: true, id: true },
      },
    },
  });
};

export const recordView = async (ad_id: string, user_id?: string) => {
  try {
    return prisma.$transaction(async ($tsx) => {
      await $tsx.view.create({
        data: { ad_id, user_id },
      });
      await $tsx.ad.update({
        where: { id: ad_id },
        data: {
          views: {
            increment: 1,
          },
        },
      });
    });
  } catch (error) {
    // User already viewed.
  }
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

export const createNewAdDraft = async (user_id: string, data: AdDraftInput) => {
  const count = await prisma.adDraft.count({ where: { user_id } });

  if (count >= config.adDraftsLimit)
    throw new BadRequestError("Draft limit reached");

  const { ad_type, step_index, content } = data;

  return prisma.adDraft.create({
    data: {
      ad_type,
      content,
      step_index,
      user: {
        connect: {
          id: user_id,
        },
      },
    },
  });
};

export const syncAdDraft = async (
  user_id: string,
  draft_id: string,
  data: AdDraftInput,
) => {
  const { ad_type, step_index, content } = data;

  return prisma.adDraft.update({
    where: {
      id: draft_id,
      user_id,
    },
    data: {
      user_id,
      ad_type,
      content,
      step_index,
    },
  });
};

export const getAdDraftsByUser = async (user_id: string) => {
  return prisma.adDraft.findMany({
    where: { user_id },
    orderBy: { updated_at: "desc" },
  });
};

export const deleteAdDraft = async (id: string) => {
  return prisma.adDraft.delete({
    where: { id },
  });
};

export const deleteAdDrafts = async (user_id: string) => {
  return prisma.adDraft.deleteMany({
    where: { user_id },
  });
};
