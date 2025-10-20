import Logger from "@libs/logger";
import { verifyToken } from "@utils/jwt";
import { NextFunction, Request, Response } from "express";

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (!token) return next(); // No token → anonymous access
  
  try {
    const decoded = verifyToken(token, true);
    if (decoded.role === "ANONYMOUS") return next();
    req.user = decoded;
    next();
  } catch (error) {
    Logger.error(error);
    res.status(401).json({ message: "Invalid token" });
  }
};
