import signCloudinaryUploadRequest from "@controllers/cloudinary.js";
import { authenticateJWT } from "@middlewares/authMiddleware.js";
import { Router } from "express";

const router = Router();

router.post(
  "/gen-signature",
  authenticateJWT,
  signCloudinaryUploadRequest
);

export default router;
