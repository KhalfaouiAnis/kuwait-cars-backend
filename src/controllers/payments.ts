import { initiatePayment } from "@services/payment.js";
import { Request, Response } from "express";

export const paymentRequest = async (req: Request, res: Response) => {
  const data = await initiatePayment(req.body);
  res.json(data.paymentUrl);
};

export const paymentSuccess = async (req: Request, res: Response) => {
  const { adType, draftId } = req.query;
  const appSuccessUrl = `x-car://create/${adType}?status=success&draftId=${draftId}`;

  res.redirect(appSuccessUrl);
};

export const paymentFailure = async (req: Request, res: Response) => {
  const { adType, draftId } = req.query;
  const appSuccessUrl = `x-car://create/${adType}?status=error&draftId=${draftId}`;

  res.redirect(appSuccessUrl);
};
