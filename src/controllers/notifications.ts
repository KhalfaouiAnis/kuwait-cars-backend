import { prisma } from "database/index.js";
import {
  getUnreadNotificationsCount,
  getUserNotifications,
  markAllNotificationsRead,
  sendNotificationToUser,
  updatePushToken,
} from "@services/notification.js";
import { Request, Response } from "express";
import { NotificationData, NotificationType } from "types/notification.js";
import { NotifiStatus } from "generated/prisma/enums.js";

export const updateExpoPushToken = async (req: Request, res: Response) => {
  const user = await updatePushToken(req.user.userId, req.body);
  res.json(user);
};

export async function getNotificationsHandler(req: Request, res: Response) {
  const { userId } = req.user;
  const pageNumber = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;

  const { hasMore, notifications, page, total } = await getUserNotifications(
    userId,
    pageNumber,
    limit,
  );

  return res.json({
    data: notifications,
    hasMore,
    total,
    page,
  });
}

// GET /notifications/unread-count
export async function getUnreadCountHandler(req: Request, res: Response) {
  const { userId } = req.user;
  const count = await getUnreadNotificationsCount(userId);
  return res.json({ count });
}

// PUT /notifications/read-all
export async function markAllReadHandler(req: Request, res: Response) {
  const { userId } = req.user;
  await markAllNotificationsRead(userId);
  return res.json({ success: true });
}

export async function sendNotificationHandler(req: Request, res: Response) {
  const { userId, type, data } = req.body as {
    userId: string;
    type: NotificationType;
    data: NotificationData<typeof type>;
  };

  if (!userId || !type) {
    return res.status(400).json({ error: "userId and type are required" });
  }

  if (!Object.values(NotificationType).includes(type)) {
    return res
      .status(400)
      .json({ error: `Unknown notification type: ${type}` });
  }

  try {
    await sendNotificationToUser(userId, type, data);
    return res.json({ success: true });
  } catch (err) {
    console.error("[sendNotificationHandler]", err);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}

export async function registerTokenHandler(req: Request, res: Response) {
  const { userId } = req.user;
  const { token } = req.body as { token: string };

  if (!token) return res.status(400).json({ error: "token is required" });

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { expo_push_token: token },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to save token" });
  }
}

export async function markReadHandler(req: Request, res: Response) {
  const { userId } = req.user;
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
    });
    
    if (!notification || notification.user_id !== userId) {
      return res.status(404).json({ error: "Not found" });
    }

    await prisma.notification.update({
      where: { id },
      data: { is_read: true, status: NotifiStatus.READ },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: "Failed to mark as read" });
  }
}
