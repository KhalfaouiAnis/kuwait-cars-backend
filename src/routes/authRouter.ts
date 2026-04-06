import { Router } from "express";
import {
  guestSession,
  appleSignIn,
  facebookSignIn,
  forgotPassword,
  generateAndSendOTP,
  googleSignIn,
  loginUser,
  refreshToken,
  registerUser,
  resetPassword,
  verifyOTPCode,
} from "@controllers/auth.js";
import { validate } from "@middlewares/validationMiddleware.js";
import {
  LoginSchema,
  RequestResetPasswordSchema,
  ResetPasswordSchema,
  SignupSchema,
} from "types/user.js";

const router = Router();

router.post("/login", validate(LoginSchema), loginUser);
router.post("/guest", guestSession);

router.post(
  "/forgot-password",
  validate(RequestResetPasswordSchema),
  forgotPassword,
);
router.post("/reset-password", validate(ResetPasswordSchema), resetPassword);

router.post("/google", googleSignIn);
router.post("/apple", appleSignIn);
router.post("/facebook", facebookSignIn);

router.post("/register", validate(SignupSchema), registerUser);

router.post("/request-otp", generateAndSendOTP);
router.post("/verify-otp", verifyOTPCode);

router.post("/refresh", refreshToken);

export default router;
