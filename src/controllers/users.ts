import {
  deleteUser,
  fetchUserDetails,
  fetchUsers,
  updateProfile,
} from "@services/user";
import { Request, Response } from "express";

export const updateUserProfile = async (req: Request, res: Response) => {
  const user = await updateProfile(req);
  res.json({ user });
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const users = await fetchUsers();
    res.json({ users });
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json("Unexpected error");
  }
};

export const getUserDetails = async (req: Request, res: Response) => {
  try {
    const user = await fetchUserDetails(req.user!.userId);
    res.json({ user });
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json("Unexpected error");
  }
};

export const dropUser = async (req: Request, res: Response) => {
  try {
    const user = await deleteUser(req.user!.userId);
    res.json({ user });
  } catch (error: unknown) {
    if (error instanceof Error) res.status(400).json({ error: error.message });
    res.status(400).json("Unexpected error");
  }
};
