import { Request, Response } from "express";
import {
  authenticateUser,
  createAccount,
  generateAndSendEmailOTP,
  generateAnonymousSessionToken,
  handleForgotPasswordRequest,
  handleResetPassword,
  handleUpdatePassword,
  refreshTokenHelper,
  handleFacebookSignin,
  handleGoogleSignin,
  verifyOTP,
  handleAppleSignin,
} from "@services/auth.js";

export const loginUser = async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const { accessToken, refreshToken, user } = await authenticateUser({
    phone,
    password,
  });
  res.status(200).json({ accessToken, refreshToken, user });
};

export const registerUser = async (req: Request, res: Response) => {
  const user = await createAccount(req.body);
  res.status(201).json(user);
};

export const forgotPassword = async (req: Request, res: Response) => {
  const result = await handleForgotPasswordRequest({
    email: req.body.email,
    phone: req.body.phone,
  });

  res.json(result);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { identifier, otp, newPassword } = req.body;

  const result = await handleResetPassword({ identifier, otp, newPassword });
  res.json(result);
};

export const updatePassword = async (req: Request, res: Response) => {
  await handleUpdatePassword(req.user.userId, req.body);
  res.status(200).json({ ok: true });
};

export const generateAndSendOTPByEmail = async (
  req: Request,
  res: Response
) => {
  await generateAndSendEmailOTP(req.body.email, 10);
  res.send({ ok: true });
};

export const verifyOTPCode = async (req: Request, res: Response) => {
  const { accessToken, refreshToken, user } = await verifyOTP(
    req.body.email,
    req.body.otp
  );
  res.send({ accessToken, refreshToken, user });
};

export const refreshToken = async (req: Request, res: Response) => {
  const accessToken = await refreshTokenHelper(req.body.refreshToken);
  res.json({ accessToken });
};

export const anonymousSession = (_: Request, res: Response) => {
  const { role, token } = generateAnonymousSessionToken();

  res.json({ token, role });
};

export const googleSignIn = async (req: Request, res: Response) => {
  const response = await handleGoogleSignin(req.body.idToken);

  if (response) {
    return res.json({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
      user: response.user,
    });
  }
};

export const appleSignIn = async (req: Request, res: Response) => {
  const response = await handleAppleSignin(req.body.idToken);

  if (response) {
    return res.json({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
  }
};

export const facebookSignIn = async (req: Request, res: Response) => {
  const response = await handleFacebookSignin(req.body.accessToken);

  if (response) {
    return res.json({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
  }
};
