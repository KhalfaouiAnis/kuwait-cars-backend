import { initiatePayment } from "@services/payment.js";
import { Request, Response } from "express";

export const paymentRequest = async (req: Request, res: Response) => {
  const data = await initiatePayment(req.body);
  res.json(data.paymentUrl);
};

export const paymentSuccess = async (req: Request, res: Response) => {
  const appSuccessUrl = "x-car:///(protected)/(tabs)/create/[ad_type]?status=success";

  res.redirect(appSuccessUrl);
};

export const paymentFailure = async (req: Request, res: Response) => {
  const appSuccessUrl = "x-car:///(protected)/(tabs)/create/[ad_type]?status=error";

  res.redirect(appSuccessUrl);
};
