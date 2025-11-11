import { Router } from "express";
import { authenticateJWT } from "@middlewares/authMiddleware";
import { handleUpload, uploadAdFiles } from "@middlewares/uploadMiddleware";
import { listAds, postAd, removeAd } from "@controllers/ads";

const router = Router();

// use grouped routes for each category ex router.use("/vehicles",vehiclesRouter)
router.post("/create", authenticateJWT, handleUpload(uploadAdFiles), postAd);
router.post("/", authenticateJWT, listAds);
router.delete("/:id", authenticateJWT, removeAd);

export default router;
