import { config } from "@config/environment.js";
import { prisma } from "database";
import { Request, Response } from "express";

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === config.whatsapp.verifyToken) {
    console.log("[WEBHOOK] Verified successfully.");
    return res.status(200).send(challenge);
  }

  return res.status(403).send("Forbidden");
};

export const handleWhatsAppEvents = async (req: Request, res: Response) => {
  res.status(200).send("EVENT_RECEIVED");

  try {
    const entry = req.body.entry?.[0];
    const status = entry?.changes?.[0]?.value?.statuses?.[0];

    if (status) {
      const { id: wamid, status: delivery_status } = status;

      await prisma.otp.updateMany({
        where: { wamid },
        data: { delivery_status },
      });
    }
  } catch (error) {
    console.error("[WEBHOOK_ERROR]", error);
  }
};
