import {
  deleteUser,
  fetchUserDetails,
  fetchUsers,
  updateProfile,
} from "@services/user.js";
import { Request, Response } from "express";

export const updateUserProfile = async (req: Request, res: Response) => {
  const user = await updateProfile(req.user.userId, req.body);
  res.json({ user });
};

export const listUsers = async (req: Request, res: Response) => {
  const users = await fetchUsers();
  res.json({ users });
};

export const getUserDetails = async (req: Request, res: Response) => {
  const user = await fetchUserDetails(req.user.userId);
  res.json({ user });
};

export const dropUser = async (req: Request, res: Response) => {
  const user = await deleteUser(req.user.userId);
  res.json({ user });
};
