import express from "express";
import {
  handleWhatsAppEvents,
  verifyWebhook,
} from "@controllers/whatsapp.webhook.js";

const router = express.Router();

router.get("/whatsapp", verifyWebhook);
router.post("/whatsapp", handleWhatsAppEvents);

export default router;
