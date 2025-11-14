import {
  deleteAd,
  fetchAdDetails,
  fetchAds,
  fetchUserAds,
  saveAd,
  toggleFavoriteAd,
} from "@services/ad";
import { Request, Response } from "express";

export const postAd = async (req: Request, res: Response) => {
  if (req.isAnonymous) return res.status(403).json();
  const newAd = await saveAd(req);
  res.json(newAd);
};

export const listAds = async (req: Request, res: Response) => {
  const ads = await fetchAds(req);
  res.json(ads);
};

export const listUserAds = async (req: Request, res: Response) => {
  if (req.isAnonymous) return res.json([]);
  const ads = await fetchUserAds(req.user.userId);
  res.json(ads);
};

export const adDetails = async (req: Request, res: Response) => {
  const ads = await fetchAdDetails(
    req.params.id,
    req.user.userId,
    req.isAnonymous
  );
  res.json(ads);
};

export const removeAd = async (req: Request, res: Response) => {
  if (req.isAnonymous) return res.status(403).json();
  await deleteAd(req.params.id);
  res.status(204).json();
};

export const toggleFavorite = async (req: Request, res: Response) => {
  if (req.isAnonymous) return res.status(403).json();
  await toggleFavoriteAd(req.user!.userId, req.params.id);
  res.status(200).json();
};
