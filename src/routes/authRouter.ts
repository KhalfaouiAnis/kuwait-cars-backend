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
  updatePassword,
  verifyOTPCode,
} from "@controllers/auth.js";
import { authenticateJWT } from "@middlewares/authMiddleware.js";
import { Router } from "express";

const router = Router();

router.post("/login", loginUser);
router.post("/anonymous", anonymousSession);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/update-password", updatePassword);

router.post("/google", googleSignIn);
router.post("/apple", appleSignIn);
router.post("/facebook", facebookSignIn);

router.post("/register", registerUser);

router.post("/request-otp", generateAndSendOTPByEmail);
router.post("/verify-otp", verifyOTPCode);

router.post("/refresh_token", authenticateJWT, refreshToken);

export default router;
