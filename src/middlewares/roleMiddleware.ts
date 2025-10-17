import { NextFunction, Request, Response } from 'express';
import { UserRole } from 'generated/prisma';

export const authorizeRole = (roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;

    if (!roles.includes(user?.role)) {
      return res.status(403).json({
        message: 'Access denied, you do not have the correct permissions',
      });
    }

    next();
  };
};
