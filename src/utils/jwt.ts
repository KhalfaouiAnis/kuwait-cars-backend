import Logger from '@libs/logger';
import jwt from 'jsonwebtoken';
import { UserRole } from 'generated/prisma';

const SECRET_KEY = process.env.JWT_SECRET || '';

export interface UserPayload {
  userId: string;
  role: UserRole;
}

export const generateToken = (userPayload: UserPayload) => {
  if (!SECRET_KEY) throw new Error('JWT_SECRET is not defined');

  return jwt.sign(userPayload, SECRET_KEY, { expiresIn: '7d' });
};

export const verifyToken = (token: string): UserPayload => {
  try {
    return jwt.verify(token, SECRET_KEY) as UserPayload;
  } catch (error) {
    Logger.error(error);
    throw new Error('Invalid token');
  }
};
