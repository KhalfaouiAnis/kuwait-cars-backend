import {
  anonymousSession,
  appleSignIn,
  facebookSignIn,
  generateAndSendOTPByEmail,
  googleSignIn,
  loginUser,
  refreshToken,
  registerUser,
  verifyOTPCode,
} from "@controllers/auth";
import { authenticateJWT } from "@middlewares/authMiddleware";
import { handleUpload, uploadImage } from "@middlewares/uploadMiddleware";
import { Router } from "express";

const router = Router();

router.post("/login", loginUser);
router.post("/anonymous", anonymousSession);

router.post("/google", googleSignIn);
router.post("/apple", appleSignIn);
router.post("/facebook", facebookSignIn);

router.post("/register", handleUpload(uploadImage), registerUser);

router.post("/request_otp", generateAndSendOTPByEmail);
router.post("/verify_otp", verifyOTPCode);

router.post("/refresh_token", authenticateJWT, refreshToken);

export default router;
