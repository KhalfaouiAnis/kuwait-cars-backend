import { Router } from "express";
import {
  adDetails,
  fetchAdsBatch,
  handleFlagAd,
  incrementAdView,
  listAds,
  listUserAds,
  listUserFavoritedAds,
  removeAd,
  repostCompletedAd,
  softRemoveAd,
  toggleFavorite,
} from "@controllers/ads.js";
import { createNewAd } from "@controllers/ads.js";
import { validate } from "@middlewares/validationMiddleware.js";
import {
  AdModelSchema,
  AdSearchSchema,
  PaymentObjectSchema,
} from "types/ad.js";
import { restrictGuest } from "@middlewares/authMiddleware.js";
import { paymentRequest } from "@controllers/payments.js";

const router = Router();

router.post("/create", restrictGuest, validate(AdModelSchema), createNewAd);
router.post(
  "/initiate-payment",
  restrictGuest,
  validate(PaymentObjectSchema),
  paymentRequest,
);
router.post("/", validate(AdSearchSchema), listAds);
router.post("/batch-list", fetchAdsBatch);
router.get("/favorite", restrictGuest, listUserFavoritedAds);
router.get("/me/:status", restrictGuest, listUserAds);
router.get("/:id", adDetails);
router.delete("/:id", restrictGuest, removeAd);
router.patch("/:id/delete", restrictGuest, softRemoveAd);
router.patch("/:id/repost", restrictGuest, repostCompletedAd);
router.post("/:id/flag", restrictGuest, handleFlagAd);
router.post("/:id/view", restrictGuest, incrementAdView);
router.post("/:id/toggle-favorite", restrictGuest, toggleFavorite);

export default router;
