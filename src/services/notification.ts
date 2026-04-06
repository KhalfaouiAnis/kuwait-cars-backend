import { prisma } from "database/index.js";
import { Expo, ExpoPushMessage, ExpoPushReceiptId } from "expo-server-sdk";
import { NotifiStatus } from "generated/prisma/enums.js";
import {
  buildPayload,
  NotificationData,
  NotificationType,
} from "types/notification.js";

const expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true,
});

export const getUserNotifications = async (
  userId: string,
  page: number,
  limit: number,
) => {
  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where: { user_id: userId } }),
  ]);

  return {
    page,
    total,
    notifications,
    hasMore: page * limit < total,
  };
};

export async function getUnreadNotificationsCount(userId: string) {
  const count = await prisma.notification.count({
    where: { user_id: userId, is_read: false },
  });
  return count;
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true },
  });
}

export const updatePushToken = async (
  userId: string,
  expo_push_token: string,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { expo_push_token },
  });
};

export async function sendNotificationToUser<T extends NotificationType>(
  userId: string,
  type: T,
  data: NotificationData<T>,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { expo_push_token: true },
  });

  if (!user?.expo_push_token) {
    console.warn(`[Notifications] No push token for user ${userId} — skipping`);
    return;
  }

  if (!Expo.isExpoPushToken(user.expo_push_token)) {
    console.error(`[Notifications] Invalid push token for user ${userId}`);
    await clearPushToken(userId);
    return;
  }

  const payload = buildPayload(type, data);

  const notification = await prisma.notification.create({
    data: {
      user_id: userId,
      body: payload.body,
      title: payload.title,
      data: payload.data as any,
      status: NotifiStatus.QUEUED,
    },
  });

  const message: ExpoPushMessage = {
    to: user.expo_push_token,
    title: payload.title,
    body: payload.body,
    data: { ...payload.data, notificationId: notification.id },
    sound: "default",
    priority: "high",
    channelId: "default",
  };

  try {
    const [ticket] = await expo.sendPushNotificationsAsync([message]);

    if (ticket.status === "ok") {
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: NotifiStatus.SENT, ticket_id: ticket.id },
      });
    } else {
      // Expo rejected the message before even trying FCM
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: NotifiStatus.FAILED,
          delivery_error: `${ticket.message}${ticket.details ? ` (${JSON.stringify(ticket.details)})` : ""}`,
        },
      });

      if (ticket.details?.error === "DeviceNotRegistered") {
        await clearPushToken(userId);
      }
    }
  } catch (err) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { status: NotifiStatus.FAILED, delivery_error: String(err) },
    });
    throw err;
  }
}

export async function sendNotificationToMany<T extends NotificationType>(
  userIds: string[],
  type: T,
  data: NotificationData<T>,
): Promise<void> {
  const results = await Promise.allSettled(
    userIds.map((id) => sendNotificationToUser(id, type, data)),
  );

  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length > 0) {
    console.error(
      `[Notifications] ${failed.length}/${userIds.length} sends failed`,
    );
  }
}

export async function checkPendingReceipts(): Promise<void> {
  const pending = await prisma.notification.findMany({
    where: {
      status: NotifiStatus.SENT,
      ticket_id: { not: null },
      receipt_id: null,
      // Only check tickets older than 15 minutes
      created_at: { lte: new Date(Date.now() - 15 * 60 * 1000) },
    },
    take: 100,
    select: {
      id: true,
      ticket_id: true,
      user_id: true,
    },
  });

  if (pending.length === 0) return;
  console.log(`[Receipts] Checking ${pending.length} pending receipts...`);

  const ticketIds = pending.map((n) => n.ticket_id!) as ExpoPushReceiptId[];
  const chunks = expo.chunkPushNotificationReceiptIds(ticketIds);

  for (const chunk of chunks) {
    const receipts = await expo.getPushNotificationReceiptsAsync(chunk);

    for (const [ticketId, receipt] of Object.entries(receipts)) {
      const notification = pending.find((n) => n.ticket_id === ticketId);
      if (!notification) continue;

      if (receipt.status === "ok") {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: NotifiStatus.DELIVERED, receipt_id: ticketId },
        });
      } else {
        const errorMsg = `${receipt.message}${receipt.details ? ` (${JSON.stringify(receipt.details)})` : ""}`;
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: NotifiStatus.FAILED,
            receipt_id: ticketId,
            delivery_error: errorMsg,
          },
        });

        if (receipt.details?.error === "DeviceNotRegistered") {
          await clearPushToken(notification.user_id);
        }
      }
    }
  }
}

async function clearPushToken(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { expo_push_token: null },
  });
  console.warn(`[Notifications] Cleared stale push token for user ${userId}`);
}
