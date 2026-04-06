import cron from "node-cron";
import { prisma } from "database/index.js";
import { NotificationType } from "types/notification.js";
import {
  checkPendingReceipts,
  sendNotificationToUser,
} from "@services/notification.js";

export function startCronJobs() {
  // ── Check Expo delivery receipts every 30 minutes ──────────────────────────
  cron.schedule("*/30 * * * *", async () => {
    console.log("[CRON] Checking push notification receipts...");
    try {
      await checkPendingReceipts();
    } catch (err) {
      console.error("[CRON] Receipt check failed:", err);
    }
  });

  // ── Notify users 1h before ad expires (runs every 5 minutes) ───────────────
  cron.schedule("*/5 * * * *", async () => {
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const fiveMinBuffer = new Date(Date.now() + 65 * 60 * 1000); // 5-min window

    try {
      const expiringAds = await prisma.ad.findMany({
        where: {
          created_at: { gte: oneHourFromNow, lte: fiveMinBuffer },
          expiry_notified: false,
        },
        select: {
          id: true,
          title: true,
          user_id: true,
        },
      });

      for (const ad of expiringAds) {
        await sendNotificationToUser(
          ad.user_id,
          NotificationType.ADVERTISE_EXPIRING_SOON,
          {
            advertiseId: ad.id,
            advertiseName: ad.title,
          },
        );

        await prisma.ad.update({
          where: { id: ad.id },
          data: { expiry_notified: true },
        });
      }
    } catch (err) {
      console.error("[CRON] Expiring ads check failed:", err);
    }
  });

  // ── Notify users when ad has expired (runs every 5 minutes) ────────────────
  cron.schedule("*/5 * * * *", async () => {
    const now = new Date();

    try {
      const expiredAds = await prisma.ad.findMany({
        where: {
          expires_at: { lte: now },
          expiry_notified: false,
        },
        select: {
          id: true,
          title: true,
          user_id: true,
        },
      });

      for (const ad of expiredAds) {
        await sendNotificationToUser(
          ad.user_id,
          NotificationType.ADVERTISE_EXPIRED,
          {
            advertiseId: ad.id,
            advertiseName: ad.title,
          },
        );

        await prisma.ad.update({
          where: { id: ad.id },
          data: { expiry_notified: true },
        });
      }
    } catch (err) {
      console.error("[CRON] Expired ads check failed:", err);
    }
  });

  console.log("[CRON] All jobs scheduled ✓");
}
