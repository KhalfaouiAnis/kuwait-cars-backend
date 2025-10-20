import Logger from "@libs/logger";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "generated/prisma";

const JWT_SECRET_KEY = process.env.JWT_SECRET || "";
const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET || "";

const REFRESH_TOKEN_EXPIRATION = (process.env.JWT_REFRESH_EXPIRATION ||
  "30d") as SignOptions["expiresIn"];
const JWT_EXPIRATION_KEY = (process.env.JWT_EXPIRATION ||
  "7d") as SignOptions["expiresIn"];

export interface UserPayload {
  userId: string;
  role: UserRole;
}

export const generateToken = (userPayload: UserPayload, access?: boolean) => {
  if (!JWT_SECRET_KEY || !JWT_REFRESH_SECRET_KEY)
    throw new Error("JWT_SECRET or REFRESH_SECRET not defined");

  if (access) {
    return jwt.sign(userPayload, JWT_SECRET_KEY, {
      expiresIn: JWT_EXPIRATION_KEY,
    });
  }

  return jwt.sign(userPayload, JWT_REFRESH_SECRET_KEY, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  });
};

export const verifyToken = (token: string, access: boolean): UserPayload => {
  try {
    if (access) {
      return jwt.verify(token, JWT_SECRET_KEY) as UserPayload;
    }
    return jwt.verify(token, JWT_REFRESH_SECRET_KEY) as UserPayload;
  } catch (error) {
    Logger.error(error);
    throw new Error("Invalid token");
  }
};
