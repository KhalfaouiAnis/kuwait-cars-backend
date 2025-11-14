import Logger from "@libs/logger";
import { verifyToken } from "@utils/jwt";
import { NextFunction, Request, Response } from "express";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token)
    return res.status(401).json({ error: "Authentication is required" });

  try {
    const decoded = verifyToken(token, true);
    req.user = { role: decoded.role, userId: "" };
    req.isAnonymous = decoded.role === 'ANONYMOUS';
    next();
  } catch (error) {
    Logger.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};
