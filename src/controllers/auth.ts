import { Request, Response } from "express";
import {
  authenticateUser,
  createAccount,
  generateAndSendOTP,
  generateAnonymousSessionToken,
  refreshTokenHelper,
  verifyAppleToken,
  verifyFacebookToken,
  verifyGoogleIdToken,
  verifyOTP,
} from "@services/auth";
import BadRequestError from "@libs/error/BadRequestError";

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const { accessToken, refreshToken, user } = await authenticateUser({
    email,
    password,
  });
  res.status(200).json({ accessToken, refreshToken, user });
};

export const registerUser = async (req: Request, res: Response) => {
  const user = await createAccount({ ...req.body, avatar: req.file });
  res.status(201).json(user);
};

export const generateAndSendOTPByEmail = async (
  req: Request,
  res: Response
) => {
  try {
    await generateAndSendOTP(req.body.email);
    res.send({ ok: true });
  } catch {
    throw new BadRequestError();
  }
};

export const verifyOTPCode = async (req: Request, res: Response) => {
  try {
    const { accessToken, refreshToken, user } = await verifyOTP(
      req.body.email,
      req.body.otp
    );
    res.send({ accessToken, refreshToken, user });
  } catch {
    throw new BadRequestError();
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return res.status(400).json({ error: "Refresh token required" });

  const result = await refreshTokenHelper(refreshToken);
  if (!result) {
    return res.status(401).json({ error: "Invalid or expired refresh token" });
  }

  res.json({ accessToken: result });
};

export const anonymousSession = (_: Request, res: Response) => {
  const { role, token } = generateAnonymousSessionToken();

  res.json({ token, role });
};

export const googleSignIn = async (req: Request, res: Response) => {
  const response = await verifyGoogleIdToken(req.body.idToken);

  if (response) {
    return res.json({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
  }

  res.status(400).json({ error: "Error verifying google id token" });
};

export const appleSignIn = async (req: Request, res: Response) => {
  const response = await verifyAppleToken(
    req.body.identityToken,
    req.body.fullName
  );

  if (response) {
    return res.json({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
  }

  res.status(400).json({ error: "Error verifying apple identity token" });
};

export const facebookSignIn = async (req: Request, res: Response) => {
  const response = await verifyFacebookToken(req.body.accessToken);

  if (response) {
    return res.json({
      accessToken: response.accessToken,
      refreshToken: response.refreshToken,
    });
  }

  res.status(400).json({ error: "Error verifying facebook access token" });
};
