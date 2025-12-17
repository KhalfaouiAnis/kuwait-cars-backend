import { Router } from "express";
import { authenticateJWT } from "@middlewares/authMiddleware.js";
import {
  handleFlagAd,
  listAds,
  listUserAds,
  removeAd,
  toggleFavorite,
} from "@controllers/ads.js";
import { createNewAd } from "@controllers/ads.js";

const router = Router();

router.post("/create", authenticateJWT, createNewAd);
router.post("/", authenticateJWT, listAds);
router.delete("/:id", authenticateJWT, removeAd);
router.post("/:id/toggle-favorite", authenticateJWT, toggleFavorite);
router.post("/:id/flag", authenticateJWT, handleFlagAd);
router.get("/myads", authenticateJWT, listUserAds);

export default router;
