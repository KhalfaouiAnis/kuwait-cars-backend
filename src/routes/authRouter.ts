import {
  guestSession,
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
import { validate } from "@middlewares/validationMiddleware.js";
import { Router } from "express";
import {
  LoginSchema,
  RequestResetPasswordSchema,
  ResetPasswordSchema,
  SignupSchema,
  UpdatePasswordSchema,
} from "types/user.js";

const router = Router();

router.post("/login", validate(LoginSchema), loginUser);
router.post("/guest", guestSession);

router.post(
  "/forgot-password",
  validate(RequestResetPasswordSchema),
  forgotPassword
);
router.post("/reset-password", validate(ResetPasswordSchema), resetPassword);
router.post("/update-password", validate(UpdatePasswordSchema), updatePassword);

router.post("/google", googleSignIn);
router.post("/apple", appleSignIn);
router.post("/facebook", facebookSignIn);

router.post("/register", validate(SignupSchema), registerUser);

router.post("/request-otp", generateAndSendOTPByEmail);
router.post("/verify-otp", verifyOTPCode);

router.post("/refresh_token", authenticateJWT, refreshToken);

export default router;
