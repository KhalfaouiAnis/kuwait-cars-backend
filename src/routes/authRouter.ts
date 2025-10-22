import {
  anonymousSession,
  appleSignIn,
  facebookSignIn,
  forgotPassword,
  generateAndSendOTPByEmail,
  googleSignIn,
  loginUser,
  refreshToken,
  registerUser,
  resetPassword,
  verifyOTPCode,
} from "@controllers/auth";
import { authenticateJWT } from "@middlewares/authMiddleware";
import { handleUpload, uploadImage } from "@middlewares/uploadMiddleware";
import { Router } from "express";

const router = Router();

router.post("/login", loginUser);
router.post("/anonymous", anonymousSession);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.post("/google", googleSignIn);
router.post("/apple", appleSignIn);
router.post("/facebook", facebookSignIn);

router.post("/register", handleUpload(uploadImage), registerUser);

router.post("/request-otp", generateAndSendOTPByEmail);
router.post("/verify-otp", verifyOTPCode);

router.post("/refresh_token", authenticateJWT, refreshToken);

export default router;
