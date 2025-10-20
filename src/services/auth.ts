import { prisma } from "database";
import {
  LoginInterface,
  LoginSchema,
  SignupInterface,
  SignupSchema,
} from "types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { generateToken, UserPayload } from "@utils/jwt";
import { UserRole } from "generated/prisma";
import BadRequestError from "@libs/error/BadRequestError";
import { transporter } from "./mailer";
import { generateOTPCode } from "@utils/otp";

import { OAuth2Client } from "google-auth-library";
import jwksClient from "jwks-rsa";

export const authenticateUser = async (data: LoginInterface) => {
  const { email, password } = LoginSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { email },
    omit: { created_at: true, updated_at: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password!))) {
    throw new BadRequestError({ message: "Invalid Credentials" });
  }

  return {
    user: {
      ...user,
      password: undefined,
    },
    acessToken: generateToken({ role: user.role, userId: user.id }, true),
    refreshToken: generateToken({ role: user.role, userId: user.id }, false),
  };
};

export const hashPassword = (password: string) => bcrypt.hash(password, 10);

export const createAccount = async (data: SignupInterface) => {
  const parsedData = SignupSchema.parse(data);
  const hashedPassword = await hashPassword(parsedData.password);

  const avatarUrl = parsedData.avatar
    ? `/uploads/images/${parsedData.avatar.filename}`
    : null;

  const user = await prisma.user.create({
    data: {
      ...parsedData,
      password: hashedPassword,
      avatar: avatarUrl,
      role: parsedData.role ? parsedData.role : UserRole.USER,
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      avatar: true,
    },
  });

  if (!user) {
    throw new BadRequestError({
      message: "Error occured while registering the user.",
    });
  }

  return user;
};

export const generateAndSendOTP = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new BadRequestError({ message: "User not found" });

  const otp = generateOTPCode(1);
  const hashedOtp = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.otp.deleteMany({ where: { userId: user.id } });

  await prisma.otp.create({
    data: { userId: user.id, code: hashedOtp, expiresAt, used: false },
  });

  await transporter.sendMail({
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
  });
};

export const verifyOTP = async (email: string, otp: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new BadRequestError({ message: "User not found" });

  const dbOtp = await prisma.otp.findFirst({
    where: { userId: user.id, used: false, expiresAt: { gt: new Date() } },
  });

  if (!dbOtp || !(await bcrypt.compare(otp, dbOtp.code))) {
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
      process.env.JWT_REFRESH_SECRET || ""
    ) as UserPayload;

    if (!decoded.userId) throw new Error("Invalid payload");

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) return null;

    // Issue new access token
    return generateToken({ role: decoded.role, userId: decoded.userId }, true);
  } catch (error) {
    console.error("Refresh failed:", error);
    return null;
  }
};

export const generateAnonymousSessionToken = () => {
  const payload = { role: UserRole.ANONYMOUS };
  const token = jwt.sign(payload, process.env.JWT_SECRET || "30m", {
    expiresIn: "30m",
  });

  return { token, role: UserRole.ANONYMOUS };
};

export const verifyGoogleIdToken = async (
  idToken: string
): Promise<{ accessToken: string; refreshToken: string } | undefined> => {
  if (!idToken) throw new BadRequestError({ message: "ID token required" });

  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new BadRequestError({ message: "Invalid token" });

    const { email, name: fullname, picture: avatar, sub: googleId } = payload;

    const user = await prisma.user.upsert({
      where: { email }, // Or use googleId if preferred
      update: { fullname, avatar, updated_at: new Date() },
      create: {
        id: googleId, // Use Google's ID as unique
        email: email ? email : "",
        fullname: fullname ? fullname : "",
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
    console.log(error);
  }
};

export const verifyFacebookToken = async (
  accessToken: string
): Promise<{ accessToken: string; refreshToken: string } | undefined> => {
  if (!accessToken)
    throw new BadRequestError({ message: "Access token required" });

  const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;

  try {
    const params = {
      access_token: accessToken,
      fields: "id,email,first_name,last_name,picture.type(large)",
      appsecret_proof: FB_APP_SECRET!,
    };

    const url = new URL("https://graph.facebook.com/me");
    url.search = new URLSearchParams(params).toString();

    const fbRes = await fetch(url);

    const payload = await fbRes.json();
    if (!payload.email)
      throw new BadRequestError({ message: "Email not provided by Facebook" });

    const {
      id: fbId,
      email,
      first_name: firstName,
      last_name: lastName,
      picture,
    } = payload;
    const fullname = `${firstName} ${lastName}`.trim();
    const avatar = picture?.data?.url;

    const user = await prisma.user.upsert({
      where: { email },
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

const client = jwksClient({
  jwksUri: "https://appleid.apple.com/auth/keys",
});

function getAppleKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    const signingKey = key?.getPublicKey();
    callback(null, signingKey);
  });
}

export interface ApplePayload {
  sub: string;
  email: string;
}

export const upsertAppleUser = async (
  payload: any,
  fullName?: any
): Promise<any> => {
  const { sub: appleId, email } = payload;
  if (!email) throw new Error("Email required");

  const fullname =
    `${fullName?.givenName || ""} ${fullName?.familyName || ""}`.trim() ||
    "Apple User";

  return prisma.user.upsert({
    where: { email },
    update: { fullname, updated_at: new Date() },
    create: {
      id: appleId,
      email,
      fullname,
      role: "USER",
      phone: "",
    },
  });
};

export const verifyAppleIdentityToken = async (
  identityToken: string
): Promise<any | null> => {
  return new Promise((resolve, reject) => {
    const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;

    jwt.verify(
      identityToken,
      getAppleKey,
      {
        audience: APPLE_CLIENT_ID,
        issuer: "https://appleid.apple.com",
        algorithms: ["RS256"],
      },
      (err, decodedRaw) => {
        if (err || !decodedRaw || typeof decodedRaw !== "object") {
          reject(new Error("Invalid Apple token"));
          return;
        }
        resolve(decodedRaw as any);
      }
    );
  });
};

export const verifyAppleToken = async (
  identityToken: string,
  fullName: any
) => {
  if (!identityToken)
    throw new BadRequestError({ message: "Identity token required" });

  try {
    const decoded = await verifyAppleIdentityToken(identityToken);
    const user = await upsertAppleUser(decoded, fullName);

    return {
      accessToken: generateToken({ userId: user.id, role: user.role }, true),
      refreshToken: generateToken({ userId: user.id, role: user.role }),
    };
  } catch (error) {
    console.error("Apple auth failed:", error);
  }
};
