import { saveAdFlowOne } from "@services/flowOne/ad";
import { Request, Response } from "express";

export const postAdFlowOne = async (req: Request, res: Response) => {
  if (req.isAnonymous) return res.status(403).json();
  const newAd = await saveAdFlowOne(req);
  res.json(newAd);
};
