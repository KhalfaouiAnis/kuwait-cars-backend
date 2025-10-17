import Logger from '@libs/logger';
import { verifyToken } from '@utils/jwt';
import { NextFunction, Request, Response } from 'express';

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (error) {
    Logger.error(error);
    res.status(403).json({ message: 'Invalid token' });
  }
};
