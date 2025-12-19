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
    req.isAnonymous = decoded.role === "ANONYMOUS";
    req.user = {
      role: decoded.role,
      userId: decoded.role === "ANONYMOUS" ? "" : decoded.userId,
    };
    next();
  } catch (error) {
    Logger.error(error);
    throw new UnauthorizedError();
  }
};
