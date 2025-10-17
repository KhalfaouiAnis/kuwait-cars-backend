import { prisma } from 'database';
import {
  LoginInterface,
  LoginSchema,
  SignupInterface,
  SignupSchema,
} from 'types';
import bcrypt from 'bcryptjs';
import { generateToken } from '@utils/jwt';
import { UserRole } from 'generated/prisma';

export const authenticateUser = async (data: LoginInterface) => {
  const { email, password } = LoginSchema.parse(data);

  const user = await prisma.user.findUnique({
    where: { email },
    omit: { created_at: true, updated_at: true },
  });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Invalid credentials');
  }

  return {
    user: {
      ...user,
      password: undefined,
    },
    token: generateToken({ role: user.role, userId: user.id }),
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
      role: parsedData.role ? parsedData.role : UserRole.STUDENT,
    },
    select: {
      id: true,
      email: true,
      fullname: true,
      avatar: true,
    },
  });

  if (!user) {
    throw new Error('Error occured while registering the user.');
  }

  return user;
};
