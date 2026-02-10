import {
  createAd,
  deleteAd,
  fetchAdDetails,
  fetchAds,
  fetchUserAds,
  flagAd,
  getAdsByIds,
  getAdDraftsByUser,
  getUserFavoritedAds,
  recordView,
  repostAd,
  softDeleteAd,
  syncAdDraft,
  toggleFavoriteAd,
  deleteAdDraft,
  deleteAdDrafts,
  createNewAdDraft,
} from "@services/ad.js";
import { Request, Response } from "express";
import { Ad, AdStatus } from "generated/prisma/client.js";
import { PaginatedResponse } from "types";
import { AdSearchInterface } from "types/ad.js";

export const createNewAd = async (req: Request, res: Response) => {
  const newAd = await createAd(req.user.userId, req.body);
  res.json(newAd);
};

export const repostCompletedAd = async (req: Request, res: Response) => {
  const repostedAd = await repostAd(req.params.id);
  res.json(repostedAd);
};

export const listAds = async (
  req: Request<any, any, AdSearchInterface>,
  res: Response<PaginatedResponse<Ad>>,
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
    userId,
  );
  res.status(200).json({
    status: "success",
    ...ads,
  });
};

export const listUserAdDrafts = async (req: Request, res: Response) => {
  const ads = await getAdDraftsByUser(req.user.userId);
  res.json(ads);
};

export const createAdDraft = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const draft = await createNewAdDraft(userId, req.body);
  res.json(draft);
};

export const updateAdDraft = async (req: Request, res: Response) => {
  const userId = req.user.userId;
  const draft = await syncAdDraft(userId, req.params.id, req.body);
  res.json(draft);
};

export const removeAdDraft = async (req: Request, res: Response) => {
  await deleteAdDraft(req.params.id);
  res.status(204);
};

export const removeUserAdDrafts = async (req: Request, res: Response) => {
  await deleteAdDrafts(req.user.userId);
  res.status(204);
};

export const listUserAds = async (req: Request, res: Response) => {
  const ads = await fetchUserAds(
    req.user.userId,
    req.params.status as AdStatus,
  );
  res.json(ads);
};

export const listUserFavoritedAds = async (req: Request, res: Response) => {
  const ads = await getUserFavoritedAds(req.user.userId);
  res.json(ads);
};

export const fetchAdsBatch = async (
  req: Request<any, any, { ids: string[] }>,
  res: Response,
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
  await deleteAd(req.params.id, req.user.userId);
  res.status(204).json();
};

export const softRemoveAd = async (req: Request, res: Response) => {
  await softDeleteAd(req.params.id, req.user.userId);
  res.status(204).json();
};

export const toggleFavorite = async (req: Request, res: Response) => {
  await toggleFavoriteAd(req.user.userId, req.params.id);
  res.status(200).json();
};

export const handleFlagAd = async (req: Request, res: Response) => {
  await flagAd(req.user.userId, req.params.id);
  res.status(200).json();
};

export const incrementAdView = async (req: Request, res: Response) => {
  await recordView(req.params.id);
};
