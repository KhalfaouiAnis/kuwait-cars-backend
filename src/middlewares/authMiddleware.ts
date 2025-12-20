import { ForbiddenError } from "@libs/error/ForbiddenError.js";
import { UserRole } from "generated/prisma/client.js";
import { UnauthorizedError } from "@libs/error/UnauthorizedError.js";
import Logger from "@libs/logger.js";
import { verifyToken } from "@utils/jwt.js";
import { NextFunction, Request, Response } from "express";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) throw new UnauthorizedError();

  try {
    const decoded = verifyToken(token, true);
    req.isGuest = decoded.role === "GUEST";
    req.user = {
      role: decoded.role,
      userId: decoded.role === "GUEST" ? "" : decoded.userId,
    };
    next();
  } catch (error) {
    Logger.error(error);
    throw new UnauthorizedError();
  }
};

export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, _: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError("You are not allowed to perform this action.");
    }
    next();
  };
};

export const restrictGuest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role === "GUEST") {
    throw new ForbiddenError("You are not allowed to perform this action.");
  }
  next();
};
