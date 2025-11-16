import BadRequestError from "@libs/error/BadRequestError";
import { BAD_REQUEST_ERROR, NOT_FOUND_ERROR } from "@libs/error/error-code";
import { buildAdFilters } from "@libs/filters/query-filter";
import { ADS_PAGE_SIZE } from "constatnts";
import { prisma } from "database";
import { Request } from "express";

import { CursorPaginationQuery } from "types";
import { AdFiltersSchema } from "types/ad";
import { deleteFile } from "@utils/upload";

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
        car: { select: { mark: true, brand: true } },
        media: { select: { url: true, type: true } },
        ...(req.isAnonymous
          ? {}
          : {
              favorited_by: {
                where: { id: req.user.userId },
                select: { id: true },
              },
            }),
      },
    }),
    prisma.ad.count({ where }),
  ]);

  const adsWithFavorites = ads.map((ad) => ({
    ...ad,
    ...(!req.isAnonymous ? { isFavorited: ad.favorited_by.length > 0 } : {}),
  }));

  const hasMore = ads.length > parseInt(limit);
  const nextCursor = hasMore
    ? encodeURIComponent(ads[ads.length - 1].id)
    : null;

  const paginatedAds = hasMore
    ? (req.isAnonymous ? ads : adsWithFavorites).slice(0, parseInt(limit))
    : req.isAnonymous
      ? ads
      : adsWithFavorites;

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
    select: { id: true, price: true, title: true, car: true },
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
    },
  });

  if (!ad)
    throw new BadRequestError({
      error_code: NOT_FOUND_ERROR,
      message: "Ad not found",
    });

  return {
    ...ad,
    ...(isAnonymous ? {} : { is_favorited: ad.favorited_by.length > 0 }),
  };
};

export const deleteAd = async (id: string, user_id: string) => {
  const ad = await prisma.ad.findUnique({
    where: { id },
    select: {
      user_id: true,
      car_id: true,
      location_id: true,
      media: { select: { url: true, type: true } },
      thumbnail: true,
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

    if (ad.location_id) {
      await tx.location.delete({ where: { id: ad.location_id } });
    }
    if (ad.car_id) {
      await tx.car.delete({ where: { id: ad.car_id } });
    }
    deleteFile(ad.thumbnail);
    ad.media.forEach((media) => deleteFile(media.url));
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
