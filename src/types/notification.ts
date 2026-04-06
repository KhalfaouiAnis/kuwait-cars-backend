export enum NotificationType {
  ADVERTISE_EXPIRED = "ADVERTISE_EXPIRED",
  ADVERTISE_EXPIRING_SOON = "ADVERTISE_EXPIRING_SOON",
  PAYMENT_SUCCESS = "PAYMENT_SUCCESS",
  MISSED_CALL = "MISSED_CALL",
}

type NotificationDataMap = {
  [NotificationType.ADVERTISE_EXPIRED]: {
    advertiseId: string;
    advertiseName: string;
  };
  [NotificationType.ADVERTISE_EXPIRING_SOON]: {
    advertiseId: string;
    advertiseName: string;
  };
  [NotificationType.PAYMENT_SUCCESS]: {
    paymentId: string;
    amount: number;
    currency: string;
  };
  [NotificationType.MISSED_CALL]: { callerId: string; callerName: string };
};

export type NotificationData<T extends NotificationType> =
  NotificationDataMap[T];

export interface NotificationPayload {
  title: string;
  body: string;
  data: Record<string, unknown>;
}

export function buildPayload<T extends NotificationType>(
  type: T,
  data: NotificationData<T>,
): NotificationPayload {
  switch (type) {
    case NotificationType.ADVERTISE_EXPIRED: {
      const d = data as NotificationData<NotificationType.ADVERTISE_EXPIRED>;
      return {
        title: "📢 Ad Expired",
        body: `Your ad "${d.advertiseName}" has expired. Renew it to keep visibility.`,
        data: { type, ...d },
      };
    }
    case NotificationType.ADVERTISE_EXPIRING_SOON: {
      const d =
        data as NotificationData<NotificationType.ADVERTISE_EXPIRING_SOON>;
      return {
        title: "⏰ Ad Expiring Soon",
        body: `Your ad "${d.advertiseName}" expires in 1 hour!`,
        data: { type, ...d },
      };
    }
    case NotificationType.PAYMENT_SUCCESS: {
      const d = data as NotificationData<NotificationType.PAYMENT_SUCCESS>;
      return {
        title: "✅ Payment Successful",
        body: `Payment of ${d.amount} ${d.currency} was confirmed.`,
        data: { type, ...d },
      };
    }
    case NotificationType.MISSED_CALL: {
      const d = data as NotificationData<NotificationType.MISSED_CALL>;
      return {
        title: "📞 Missed Call",
        body: `You missed a call from ${d.callerName}.`,
        data: { type, ...d },
      };
    }
    default:
      throw new Error(`Unknown notification type: ${type}`);
  }
}
