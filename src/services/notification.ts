import { prisma } from "database";
import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendUserNotification = async (
  user_id: string,
  title: string,
  body: string,
  data: any,
) => {
  const [user, notification] = await prisma.$transaction([
    prisma.user.update({
      where: { id: user_id },
      data: { unread_count: { increment: 1 } },
    }),
    prisma.notification.create({
      data: { user_id, title, body, data },
    }),
  ]);

  if (!user.expo_push_token) return;

  // 2. Send to Expo
  await expo.sendPushNotificationsAsync([
    {
      to: user.expo_push_token,
      sound: "default",
      title,
      body,
      badge: user.unread_count,
      data: { ...data, notificationId: notification.id },
    },
  ]);
};

export const updatePushToken = async (
  userId: string,
  expo_push_token: string,
) => {
  return prisma.user.update({
    where: { id: userId },
    data: { expo_push_token },
  });
};
