import { prisma } from "database/index.js";
import {
  LoginInterface,
  RequestResetPasswordInterface,
  ResetPasswordInterface,
  SignupInterface,
  UpdatePasswordInterface,
} from "types/user.js";
import { config } from "@config/environment.js";
import bcrypt from "bcryptjs";

import { generateGuestToken, generateToken } from "@utils/jwt.js";
import { generateOTPCode } from "@utils/otp.js";

import { OAuth2Client } from "google-auth-library";
import { sendOtpEmail } from "./mailer.js";
import { Prisma, User, UserRole } from "generated/prisma/client.js";
import { NotFoundError } from "@libs/error/NotFoundError.js";
import { ValidationError } from "@libs/error/ValidationError.js";
import { BadRequestError } from "@libs/error/BadRequestError.js";
import { sendWhatsAppOtp } from "./whatsapp.service.js";
import { ERROR_CODES } from "constatnts.js";

export const authenticateUser = async (data: LoginInterface) => {
  const { phone, password } = data;

  try {
    const user = await prisma.user.findUnique({
      where: { phone },
      omit: { updated_at: true },
      include: { avatar: { select: { original_url: true, public_id: true } } },
    });

    if (!user?.password) {
      throw new BadRequestError(ERROR_CODES.SOCIAL_ERROR);
    }

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new BadRequestError(ERROR_CODES.BAD_CREDENTIALS);
    }

    return {
      user: {
        ...user,
        password: undefined,
      },
      accessToken: generateToken({ role: user.role, userId: user.id }, true),
      refreshToken: generateToken({ role: user.role, userId: user.id }, false),
    };
  } catch (error) {
    throw new BadRequestError(ERROR_CODES.BAD_CREDENTIALS);
  }
};

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const createAccount = async (data: SignupInterface) => {
  const { avatar, area, password, role, ...restData } = data;

  const hashedPassword = await hashPassword(password);

  return prisma.user.create({
    data: {
      ...restData,
      avatar: avatar ? { create: avatar } : undefined,
      area: area ? area : Prisma.DbNull,
      password: hashedPassword,
      role: role ? role : UserRole.USER,
    },
    omit: {
      password: true,
      updated_at: true,
    },
  });
};

export const handleForgotPasswordRequest = async (
  data: RequestResetPasswordInterface,
) => {
  const { email, phone } = data;

  if (phone) {
    await generateAndSendOTPCode(phone, 10);
  } else if (email) {
    await generateAndSendOTPCode(email, 10);
  }

  return { ok: true };
};

export async function handleResetPassword(
  data: ResetPasswordInterface,
): Promise<{ ok: boolean }> {
  const { identifier, otp, newPassword } = data;
  let user;
  const isEmail = identifier.includes("@");

  if (isEmail) {
    user = await prisma.user.findFirstOrThrow({ where: { email: identifier } });
  } else {
    user = await prisma.user.findUniqueOrThrow({
      where: { phone: identifier },
    });
  }

  const dbOtp = await prisma.otp.findFirstOrThrow({
    where: {
      user_id: user.id,
      used: false,
      expires_at: { gt: new Date() },
      code: otp,
    },
  });

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  await prisma.otp.update({ where: { id: dbOtp.id }, data: { used: true } });

  return { ok: true };
}

export async function handleUpdatePassword(
  userId: string,
  data: UpdatePasswordInterface,
) {
  const hashedPassword = await hashPassword(data.password);

  return prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    omit: { password: true, created_at: true, updated_at: true },
  });
}

export const generateAndSendOTPCode = async (
  identifier: string,
  length?: number,
) => {
  let user;
  const isEmail = identifier.includes("@");

  if (isEmail) {
    user = await prisma.user.findFirstOrThrow({ where: { email: identifier } });
  } else {
    user = await prisma.user.findUniqueOrThrow({
      where: { phone: identifier },
    });
  }

  const lastRequest = await prisma.otp.findFirst({
    where: {
      user_id: user.id,
      created_at: { gte: new Date(Date.now() - 60000) },
    },
  });

  if (lastRequest) {
    throw new BadRequestError(ERROR_CODES.REREQUEST_OTP);
  }

  const otp = generateOTPCode(length || 1);
  const expires_at = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.deleteMany({ where: { user_id: user.id } });

  await sendWhatsAppOtp(identifier, otp);

  await prisma.otp.create({
    data: { user_id: user.id, code: otp, expires_at, used: false },
  });

  if (isEmail) {
    await sendOtpEmail(identifier, otp);
  } else {
    const response = await sendWhatsAppOtp(identifier, otp);
    console.log(response);
  }
};

export const verifyOTP = async (identifier: string, otp: string) => {
  let user;

  if (identifier.includes("@")) {
    user = await prisma.user.findFirstOrThrow({ where: { email: identifier } });
  } else {
    user = await prisma.user.findUniqueOrThrow({
      where: { phone: identifier },
    });
  }

  const dbOtp = await prisma.otp.findFirstOrThrow({
    where: {
      user_id: user.id,
      used: false,
      expires_at: { gt: new Date() },
      code: otp,
    },
  });

  await prisma.otp.update({ where: { id: dbOtp.id }, data: { used: true } });

  return {
    accessToken: generateToken({ role: user.role, userId: user.id }, true),
    refreshToken: generateToken({ role: user.role, userId: user.id }, false),
    user,
  };
};

export const generateGuestSessionToken = () => {
  return generateGuestToken();
};

export const handleGoogleSignin = async (
  idToken: string,
): Promise<
  { accessToken: string; refreshToken: string; user: User } | undefined
> => {
  if (!idToken) throw new NotFoundError(ERROR_CODES.ID_TOKEN_REQUIRED);

  const googleClient = new OAuth2Client(config.oauth.googleClientId);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: config.oauth.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload)
      throw new ValidationError([{ message: ERROR_CODES.INVALID_TOKEN, path: "token" }]);

    const { email, name: fullname, sub: googleId } = payload;

    if (!email)
      throw new ValidationError([
        { message: "Email is missing", path: "email" },
      ]);

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
          role: "USER",
          province: {
            province: "Al Asimah",
            latitude: 29.34142578906314,
            longitude: 47.97161303044713,
          },
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
  accessToken: string,
): Promise<
  { accessToken: string; refreshToken: string; user: User } | undefined
> => {
  if (!accessToken) throw new NotFoundError(ERROR_CODES.ID_TOKEN_REQUIRED);

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
      throw new ValidationError([
        { path: "email", message: "Email not provided by Facebook" },
      ]);

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
        province: {
          province: "Al Asimah",
          latitude: 29.34142578906314,
          longitude: 47.97161303044713,
        },
      },
    });

    return {
      accessToken: generateToken({ userId: user.id, role: user.role }, true),
      refreshToken: generateToken({ userId: user.id, role: user.role }),
      user,
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
      verifyOptions,
    );

    if (!appleIdTokenClaims || !appleIdTokenClaims.sub) {
      throw new BadRequestError(ERROR_CODES.ID_TOKEN_REQUIRED);
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
          province: {
            province: "Al Asimah",
            latitude: 29.34142578906314,
            longitude: 47.97161303044713,
          },
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
