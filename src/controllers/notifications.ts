import { updatePushToken } from "@services/notification";
import { Request, Response } from "express";

export const updateExpoPushToken = async (req: Request, res: Response) => {
  const user = await updatePushToken(req.user.userId, req.body);
  res.json(user);
};
