import { fetchAds, saveAd } from "@services/ad";
import { Request, Response } from "express";

export const postAd = async (req: Request, res: Response) => {
  const newAd = await saveAd(req);
  res.json(newAd);
};

export const listAds = async (req: Request, res: Response) => {
  const ads = await fetchAds(req);
  res.json(ads);
};
