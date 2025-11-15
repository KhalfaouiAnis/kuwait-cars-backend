import { Router } from "express";
import { authenticateJWT } from "@middlewares/authMiddleware";
import { handleUpload, uploadAdFiles } from "@middlewares/uploadMiddleware";
import {
  handleFlagAd,
  listAds,
  listUserAds,
  postAd,
  removeAd,
  toggleFavorite,
} from "@controllers/ads";

const router = Router();

// use grouped routes for each category ex router.use("/vehicles",vehiclesRouter)
router.post("/create", authenticateJWT, handleUpload(uploadAdFiles), postAd);
router.post("/:id/toggle-favorite", authenticateJWT, toggleFavorite);
router.post("/:id/flag", authenticateJWT, handleFlagAd);
router.post("/", authenticateJWT, listAds);
router.get("/myads", authenticateJWT, listUserAds);
router.delete("/:id", authenticateJWT, removeAd);

export default router;
