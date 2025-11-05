import { Router } from "express";
import { authenticateJWT } from "@middlewares/authMiddleware";
import { handleUpload, uploadAdFiles } from "@middlewares/uploadMiddleware";
import { listAds, postAd } from "@controllers/ads";

const router = Router();

router.post("/create", authenticateJWT, handleUpload(uploadAdFiles), postAd);
router.post("/", authenticateJWT, listAds);

export default router;
