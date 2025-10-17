import { Request, Response } from 'express';
import { authenticateUser, createAccount } from '@services/auth';

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const { token, user } = await authenticateUser({ email, password });
    res.status(200).json({ token, user });
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(401).json({ message: error.message });
    res.status(500).json('Unexpected internal error, please contact admins.');
  }
};

export const registerUser = async (req: Request, res: Response) => {
  try {
    const user = await createAccount({ ...req.body, avatar: req.file });
    res.status(201).json(user);
  } catch (error: unknown) {
    if (error instanceof Error)
      return res.status(400).json({ message: error.message });
    res.status(500).json('Unexpected internal error, please contact admins.');
  }
};
