import { Router } from "express";
import { updateUserProfile } from "@controllers/users.js";
import {
  getNotificationsHandler,
  getUnreadCountHandler,
  markAllReadHandler,
  markReadHandler,
  registerTokenHandler,
  sendNotificationHandler,
} from "@controllers/notifications.js";

const router = Router();

router.get("/", getNotificationsHandler);
router.get("/unread-count", getUnreadCountHandler);
router.put("/read-all", markAllReadHandler);

router.put("/token", registerTokenHandler);
router.post("/send", sendNotificationHandler);
router.put("/:id/read", updateUserProfile, markReadHandler);

export default router;
