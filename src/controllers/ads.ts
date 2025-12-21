import { ForbiddenError } from "@libs/error/ForbiddenError.js";
import {
  createAd,
  deleteAd,
  fetchAdDetails,
  fetchAds,
  fetchUserAds,
  flagAd,
  getAdsByIds,
  toggleFavoriteAd,
} from "@services/ad.js";
import { Request, Response } from "express";
import { Ad } from "generated/prisma/client.js";
import { PaginatedResponse } from "types";
import { AdSearchInterface } from "types/ad.js";

export const createNewAd = async (req: Request, res: Response) => {
  if (req.isGuest) throw new ForbiddenError();
  const newAd = await createAd(req.user.userId, req.body);
  res.json(newAd);
};

export const listAds = async (
  req: Request<any, any, AdSearchInterface>,
  res: Response<PaginatedResponse<Ad>>
) => {
  const userId = req.user?.role !== "GUEST" ? req.user?.userId : undefined;

  const ads = await fetchAds(
    {
      ...req.body,
      filters: {
        ...req.body.filters,
        user_id: req.body.filters?.is_mine ? req.user.userId : undefined,
      },
    },
    userId
  );
  res.status(200).json({
    status: "success",
    ...ads,
  });
};

export const listUserAds = async (req: Request, res: Response) => {
  if (req.isGuest) return res.json([]);
  const ads = await fetchUserAds(req.user.userId);
  res.json(ads);
};

export const fetchAdsBatch = async (
  req: Request<any, any, { ids: string[] }>,
  res: Response
) => {
  const { ids } = req.body;
  if (!ids || ids.length === 0) return res.json([]);

  const ads = await getAdsByIds(ids, req.user.userId);
  res.status(200).json(ads);
};

export const adDetails = async (req: Request, res: Response) => {
  const ads = await fetchAdDetails(req.params.id, req.user.userId);
  res.json(ads);
};

export const removeAd = async (req: Request, res: Response) => {
  if (req.isGuest) throw new ForbiddenError();
  await deleteAd(req.params.id, req.user.userId);
  res.status(204).json();
};

export const toggleFavorite = async (req: Request, res: Response) => {
  if (req.isGuest) throw new ForbiddenError();
  await toggleFavoriteAd(req.user.userId, req.params.id);
  res.status(200).json();
};

export const handleFlagAd = async (req: Request, res: Response) => {
  if (req.isGuest) throw new ForbiddenError();
  await flagAd(req.user.userId, req.params.id);
  res.status(200).json();
};
