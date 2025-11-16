import { Router } from "express";
import { authenticateJWT } from "@middlewares/authMiddleware";
import { handleUpload, uploadAdFiles } from "@middlewares/uploadMiddleware";
import {
  handleFlagAd,
  listAds,
  listUserAds,
  removeAd,
  toggleFavorite,
} from "@controllers/ads";
import { postAdFlowOne } from "@controllers/flowOne/ads";

const router = Router();

router.post(
  "/flow-one/create",
  authenticateJWT,
  handleUpload(uploadAdFiles),
  postAdFlowOne
);

router.post("/:id/toggle-favorite", authenticateJWT, toggleFavorite);
router.post("/:id/flag", authenticateJWT, handleFlagAd);
router.post("/", authenticateJWT, listAds);
router.get("/myads", authenticateJWT, listUserAds);
router.delete("/:id", authenticateJWT, removeAd);

export default router;
