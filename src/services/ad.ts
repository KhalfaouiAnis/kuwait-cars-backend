import BadRequestError from "@libs/error/BadRequestError.js";
import { BAD_REQUEST_ERROR, NOT_FOUND_ERROR } from "@libs/error/error-code.js";
import { buildAdFilters } from "@libs/filters/query-filter.js";
import cloudinary from "config/cloudinary.js";
import { ADS_PAGE_SIZE } from "constatnts.js";
import { prisma } from "database/index.js";
import { Request } from "express";

import { CursorPaginationQuery } from "types/index.js";
import { AdFiltersSchema, AdInterface, AdModelSchema } from "types/ad.js";

export const createAd = async (id: string, data: AdInterface) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new BadRequestError({
      message: "User unfound",
    });
  }

  const validated = AdModelSchema.safeParse(data);

  if (!validated.success) {
    throw new BadRequestError({
      context: validated.error.issues,
      message: validated.error.message,
    });
  }

  const { media, ...adData } = validated.data;

  const mediaArray = media.map(
    ({ media_type, original_url, transformed_url, public_id }) => ({
      public_id,
      media_type,
      original_url,
      transformed_url,
    })
  );

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
    include: {
      user: {
        omit: {
          password: true,
          created_at: true,
          updated_at: true,
          role: true,
        },
      },
      media: {
        omit: { created_at: true },
      },
    },
  });

  if (!ad) {
    throw new BadRequestError({
      message: "Unable to create the add, something went wrong.",
    });
  }

  return ad;
};

export const fetchAds = async (req: Request) => {
  const {
    cursor,
    limit = ADS_PAGE_SIZE,
    direction = "forward",
  } = req.query as CursorPaginationQuery;

  const { success, data: filters, error } = AdFiltersSchema.safeParse(req.body);

  if (!success)
    throw new BadRequestError({
      context: error.issues,
      error_code: BAD_REQUEST_ERROR,
    });

  const { where, orderBy, take } = buildAdFilters({
    filters,
    cursor,
    direction,
    limit,
  });

  const [ads, total] = await prisma.$transaction([
    prisma.ad.findMany({
      ...{ where, orderBy, take },
      include: {
        media: {
          select: {
            original_url: true,
            transformed_url: true,
            media_type: true,
            public_id: true,
          },
        },
        ...(req.isAnonymous
          ? {}
          : {
              favorited_by: {
                where: { id: req.user.userId },
                select: { id: true },
              },
              flagged_by: {
                where: { id: req.user.userId },
                select: { id: true },
              },
            }),
      },
    }),
    prisma.ad.count({ where }),
  ]);

  const favoritedAndFlaggedAds = ads.map((ad) => ({
    ...ad,
    ...(!req.isAnonymous
      ? {
          isFavorited: ad.favorited_by.length > 0,
          isFlagged: ad.flagged_by.length > 0,
        }
      : {}),
  }));

  const hasMore = ads.length > parseInt(limit);
  const nextCursor = hasMore
    ? encodeURIComponent(ads[ads.length - 1].id)
    : null;

  const paginatedAds = hasMore
    ? (req.isAnonymous ? ads : favoritedAndFlaggedAds).slice(0, parseInt(limit))
    : req.isAnonymous
      ? ads
      : favoritedAndFlaggedAds;

  return {
    data: paginatedAds,
    pagination: {
      hasMore,
      nextCursor,
      total,
      limit: parseInt(limit),
    },
  };
};

export const fetchUserAds = async (user_id: string) => {
  return prisma.ad.findMany({
    where: { user_id },
  });
};

export const fetchAdDetails = async (
  id: string,
  user_id: string,
  isAnonymous: boolean
) => {
  const ad = await prisma.ad.findUnique({
    where: { id },
    include: {
      favorited_by: { where: { id: user_id }, select: { id: true } },
      flagged_by: { where: { id: user_id }, select: { id: true } },
    },
  });

  if (!ad)
    throw new BadRequestError({
      error_code: NOT_FOUND_ERROR,
      message: "Ad not found",
    });

  return {
    ...ad,
    ...(isAnonymous
      ? {}
      : {
          is_favorited: ad.favorited_by.length > 0,
          isFlagged: ad.flagged_by.length > 0,
        }),
  };
};

export const deleteAd = async (id: string, user_id: string) => {
  const ad = await prisma.ad.findUnique({
    where: { id },
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
  if (!ad || ad.user_id !== user_id)
    throw new BadRequestError({
      message: "Can only deleted own ads.",
      error_code: BAD_REQUEST_ERROR,
    });

  await prisma.$transaction(async (tx) => {
    await tx.media.deleteMany({ where: { ad_id: id } });
    await tx.ad.delete({ where: { id } });

    ad.media.forEach((media) => cloudinary.uploader.destroy(media.public_id));
  });
};

export const softDeleteAd = async(id: string, user_id: string) => {
  const ad = await prisma.ad.findUnique({
    where: { id,  },
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
  if (!ad || ad.user_id !== user_id)
    throw new BadRequestError({
      message: "Can only deleted own ads.",
      error_code: BAD_REQUEST_ERROR,
    });

  await prisma.ad.update({
    where: {id},
    data: {
      deleted_at: new Date(),
    }
  })
}

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
  return prisma.$transaction(async (tx) => {
    const existing = await tx.ad.findFirst({
      where: { id, flagged_by: { some: { id: user_id } } },
      select: { id: true },
    });

    if (existing) {
      throw new BadRequestError({
        error_code: BAD_REQUEST_ERROR,
        message: "Already flagged this Ad.",
      });
    }

    return tx.ad.update({
      where: { id },
      data: { flagged_by: { connect: [{ id: user_id }] } },
    });
  });
};
