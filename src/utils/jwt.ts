import Logger from "@libs/logger.js";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserRole } from "generated/prisma/client.js";
import { config } from "@config/environment.js";
import { UnauthorizedError } from "@libs/error/UnauthorizedError.js";
import { ERROR_CODES } from "constatnts.js";

export interface UserPayload {
  userId: string;
  role: UserRole;
}

export const generateGuestToken = () => {
  const payload = { role: UserRole.GUEST, id: "" };
  const token = jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.guestExpiresIn as SignOptions["expiresIn"],
  });

  return { token, role: UserRole.GUEST };
};

export const generateToken = (userPayload: UserPayload, access?: boolean) => {
  if (access) {
    return jwt.sign(userPayload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as SignOptions["expiresIn"],
    });
  }

  return jwt.sign(userPayload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string, access: boolean): UserPayload => {
  try {
    if (access) {
      return jwt.verify(token, config.jwt.secret) as UserPayload;
    }
    return jwt.verify(token, config.jwt.refreshSecret) as UserPayload;
  } catch (error) {
    Logger.error(error);
    throw new UnauthorizedError(ERROR_CODES.INVALID_TOKEN);
  }
};

export const refreshTokenHelper = async (refreshToken: string) => {
  const decoded = jwt.verify(
    refreshToken,
    config.jwt.refreshSecret,
  ) as UserPayload;

  if (!decoded.userId) throw new UnauthorizedError(ERROR_CODES.INVALID_TOKEN);

  return generateToken({ role: decoded.role, userId: decoded.userId }, true);
};
