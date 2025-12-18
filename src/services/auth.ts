import { prisma } from "database/index.js";
import {
  LoginInterface,
  LoginSchema,
  RequestResetPasswordInterface,
  RequestResetPasswordSchema,
  ResetPasswordInterface,
  ResetPasswordSchema,
  SignupInterface,
  SignupSchema,
  UpdatePasswordInterface,
} from "types/user.js";
import { config } from "@config/environment.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { generateToken, UserPayload } from "@utils/jwt.js";
import BadRequestError from "@libs/error/BadRequestError.js";
import { generateOTPCode } from "@utils/otp.js";

import { OAuth2Client } from "google-auth-library";
import { sendOtpEmail } from "./mailer.js";
import { BAD_CREDENTIALS, BAD_REQUEST_ERROR } from "@libs/error/error-code.js";
import { User, UserRole } from "generated/prisma/client.js";

export const authenticateUser = async (data: LoginInterface) => {
  const { phone, password } = LoginSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { phone },
    omit: { updated_at: true },
  });

  if (!user?.password) {
    throw new BadRequestError({
      error_code: BAD_REQUEST_ERROR,
      message:
        "This account was created using Google, Apple or Facebook social logins, please use the right social provider to login.",
    });
  }

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new BadRequestError({
      error_code: BAD_CREDENTIALS,
      message: "Invalid credentials",
    });
  }

  return {
    user: {
      ...user,
      password: undefined,
    },
    accessToken: generateToken({ role: user.role, userId: user.id }, true),
    refreshToken: generateToken({ role: user.role, userId: user.id }, false),
  };
};

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const createAccount = async (data: SignupInterface) => {
  const { success, data: parsedData, error } = SignupSchema.safeParse(data);

  if (!success) {
    throw new BadRequestError({
      context: error.issues,
      message: "Bad request",
      logging: true,
    });
  }

  const hashedPassword = await hashPassword(parsedData.password);

  const user = await prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
      role: parsedData.role ? parsedData.role : UserRole.USER,
    },
    omit: {
      password: true,
      updated_at: true,
    },
  });

  if (!user) {
    throw new BadRequestError({
      message: "Error occured while registering the user.",
    });
  }

  return user;
};

export const handleForgotPasswordRequest = async (
  data: RequestResetPasswordInterface
) => {
  const { email, phone } = RequestResetPasswordSchema.parse(data);

  if (phone) {
    await generateAndSendPhoneOTP(phone, 10);
  } else if (email) {
    await generateAndSendEmailOTP(email, 10);
  }

  return { message: "OTP sent" };
};

export async function handleResetPassword(
  data: ResetPasswordInterface
): Promise<{ message: string }> {
  const { identifier, otp, newPassword } = ResetPasswordSchema.parse(data);
  let user;
  const isEmail = identifier.includes("@");

  if (isEmail) {
    user = await prisma.user.findFirst({ where: { email: identifier } });
  } else {
    user = await prisma.user.findUnique({ where: { phone: identifier } });
  }

  if (!user) throw new Error("User not found");

  const dbOtp = await prisma.otp.findFirst({
    where: { user_id: user.id, used: false, expires_at: { gt: new Date() } },
  });

  if (!dbOtp || otp !== dbOtp.code) {
    throw new Error("Invalid or expired OTP");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.otp.update({ where: { id: dbOtp.id }, data: { used: true } });

  return { message: "Password reset successful" };
}

export async function handleUpdatePassword(
  userId: string,
  data: UpdatePasswordInterface
) {
  const parsedData = SignupSchema.parse(data);
  const hashedPassword = await hashPassword(parsedData.password);

  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
}

export const generateAndSendPhoneOTP = async (
  phone: string,
  length?: number
) => {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) throw new BadRequestError({ message: "User not found" });

  const otp = generateOTPCode(length || 1);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.deleteMany({ where: { user_id: user.id } });

  await prisma.otp.create({
    data: { user_id: user.id, code: otp, expires_at, used: false },
  });

  await sendWhatsAppOtp(phone, otp);
};

export const generateAndSendEmailOTP = async (
  email: string,
  length?: number
) => {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) throw new BadRequestError({ message: "User not found" });

  const otp = generateOTPCode(length || 1);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.deleteMany({ where: { user_id: user.id } });

  await prisma.otp.create({
    data: { user_id: user.id, code: otp, expires_at, used: false },
  });

  await sendOtpEmail(email, otp);
};

export const verifyOTP = async (identifier: string, otp: string) => {
  let user;
  const isEmail = identifier.includes("@");

  if (isEmail) {
    user = await prisma.user.findFirst({ where: { email: identifier } });
  } else {
    user = await prisma.user.findUnique({ where: { phone: identifier } });
  }

  if (!user) throw new BadRequestError({ message: "User not found" });

  const dbOtp = await prisma.otp.findFirst({
    where: { user_id: user.id, used: false, expires_at: { gt: new Date() } },
  });

  if (!dbOtp || otp !== dbOtp.code) {
    throw new BadRequestError({ message: "Invalid/expired OTP" });
  }

  await prisma.otp.update({ where: { id: dbOtp.id }, data: { used: true } });

  return {
    accessToken: generateToken({ role: user.role, userId: user.id }, true),
    refreshToken: generateToken({ role: user.role, userId: user.id }, false),
    user,
  };
};

export const refreshTokenHelper = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      config.jwt.refreshSecret
    ) as UserPayload;

    if (!decoded.userId) throw new Error("Invalid payload");

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return null;

    return generateToken({ role: decoded.role, userId: decoded.userId }, true);
  } catch (error) {
    console.error("Refresh failed:", error);
    return null;
  }
};

export const generateAnonymousSessionToken = () => {
  const payload = { role: UserRole.ANONYMOUS, id: "" };
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: "30m",
  });

  return { token, role: UserRole.ANONYMOUS };
};

export const handleGoogleSignin = async (
  idToken: string
): Promise<
  { accessToken: string; refreshToken: string; user: User } | undefined
> => {
  if (!idToken) throw new BadRequestError({ message: "ID token required" });

  const googleClient = new OAuth2Client(config.oauth.googleClientId);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.oauth.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestError({ message: "Invalid token" });

    const { email, name: fullname, picture: avatar, sub: googleId } = payload;

    if (!email) throw new BadRequestError({ message: "Email is missing" });

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ google_id: googleId }, { email }],
      },
    });

    if (!user) {
      const emailPrefix = email.split("@")[0] || "user";

      user = await prisma.user.create({
        data: {
          email: email || "",
          google_id: googleId,
          fullname: fullname || emailPrefix.replace(/[^a-zA-Z0-9_]/g, "_"),
          phone: "",
          avatar,
          role: "USER",
        },
      });
    } else {
      if (!user.google_id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { google_id: googleId },
        });
        user.google_id = googleId;
      }
    }

    return {
      accessToken: generateToken({ userId: user.id, role: user.role }, true),
      refreshToken: generateToken({ userId: user.id, role: user.role }),
      user,
    };
  } catch (error) {
    console.log(error);
  }
};

export const handleFacebookSignin = async (
  accessToken: string
): Promise<{ accessToken: string; refreshToken: string } | undefined> => {
  if (!accessToken)
    throw new BadRequestError({ message: "Access token required" });

  try {
    const params = {
      access_token: accessToken,
      fields: "id,email,name,picture.type(large)",
      appsecret_proof: config.oauth.facebookAppSecret,
    };

    const url = new URL("https://graph.facebook.com/me");
    url.search = new URLSearchParams(params).toString();

    const fbRes = await fetch(url);

    const payload = await fbRes.json();
    if (!payload.email)
      throw new BadRequestError({ message: "Email not provided by Facebook" });

    const { id: fbId, email, name, picture } = payload;
    const fullname = `${name}`.trim();
    const avatar = picture?.data?.url;

    const user = await prisma.user.upsert({
      where: { id: fbId },
      update: { fullname, avatar, updated_at: new Date() },
      create: {
        id: fbId,
        email,
        fullname,
        avatar,
        role: "USER",
        phone: "",
      },
    });

    return {
      accessToken: generateToken({ userId: user.id, role: user.role }, true),
      refreshToken: generateToken({ userId: user.id, role: user.role }),
    };
  } catch (error) {
    console.error("Facebook auth failed:", error);
  }
};

export const handleAppleSignin = async (idToken: string) => {
  try {
    const AppleSignin = await import("apple-signin-auth");

    const verifyOptions: any = {
      audience: config.oauth.appleClientId,
      ignoreExpiration: false,
    };

    if (config.oauth.appleTeamId) {
      verifyOptions.teamId = config.oauth.appleTeamId;
    }

    const appleIdTokenClaims = await AppleSignin.default.verifyIdToken(
      idToken,
      verifyOptions
    );

    if (!appleIdTokenClaims || !appleIdTokenClaims.sub) {
      throw new Error("Invalid Apple token payload");
    }

    const email =
      appleIdTokenClaims.email ||
      `${appleIdTokenClaims.sub}@privaterelay.appleid.com`;
    const appleId = appleIdTokenClaims.sub;

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { apple_id: appleId }],
      },
    });

    if (!user) {
      const emailPrefix =
        appleIdTokenClaims.email?.split("@")[0] ||
        `apple_user_${appleId.slice(-8)}`;

      user = await prisma.user.create({
        data: {
          email: email,
          apple_id: appleId,
          fullname: emailPrefix.replace(/[^a-zA-Z0-9_]/g, "_"),
          phone: "",
        },
      });
    } else {
      if (!user.apple_id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { apple_id: appleId },
        });
        user.apple_id = appleId;
      }
    }

    return {
      accessToken: generateToken({ userId: user.id, role: user.role }, true),
      refreshToken: generateToken({ userId: user.id, role: user.role }),
      user,
    };
  } catch (error) {
    console.log(error);
  }
};

async function sendWhatsAppOtp(phone: string, otp: string) {
  return fetch(
    `https://graph.facebook.com/${config.whatsapp.version}/${config.whatsapp.phoneId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body: `Your OTP is ${otp}. It expires in 10 minutes.`,
        },
      }),
      headers: {
        Authorization: `Bearer ${config.whatsapp.token}`,
        "Content-Type": "application/json",
      },
    }
  );
}
