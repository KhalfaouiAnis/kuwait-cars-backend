import { Router } from "express";
import {
  adDetails,
  fetchAdsBatch,
  handleFlagAd,
  listAds,
  listUserAds,
  listUserFavoritedAds,
  removeAd,
  toggleFavorite,
} from "@controllers/ads.js";
import { createNewAd } from "@controllers/ads.js";
import { validate } from "@middlewares/validationMiddleware.js";
import { AdModelSchema, AdSearchSchema } from "types/ad.js";
import { restrictGuest } from "@middlewares/authMiddleware.js";

const router = Router();

router.post("/create", restrictGuest, validate(AdModelSchema), createNewAd);
router.post("/", validate(AdSearchSchema), listAds);
router.get("/me", restrictGuest, listUserAds);
router.get("/me/favorite", restrictGuest, listUserFavoritedAds);
router.post("/", validate(AdSearchSchema), listAds);
router.post("/batch-list", fetchAdsBatch);
router.get("/:id", restrictGuest, adDetails);
router.delete("/:id", restrictGuest, removeAd);
router.post("/:id/toggle-favorite", restrictGuest, toggleFavorite);
router.post("/:id/flag", restrictGuest, handleFlagAd);

export default router;
