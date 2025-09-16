import webpush from "web-push";
import * as Push from "../models/pushModel.js";

webpush.setVapidDetails(
  "mailto:stanley@petallog.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Low-level: send to a single subscription object
 */
export async function sendPush(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

/**
 * Send notification(s) to one user
 */
export async function sendPushToUser(userId, payload) {
  const subs = await Push.getSubscriptionsByUser(userId);
  let sentCount = 0;

  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    try {
      await sendPush(subscription, payload);
      sentCount++;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        // subscription expired
        await Push.deleteSubscription(sub.id);
      } else {
        console.error("Push error:", err);
      }
    }
  }

  return sentCount;
}

/**
 * Broadcast to all users
 */
export async function broadcastPush(payload) {
  const subs = await Push.getAllSubscriptions();
  let sentCount = 0;

  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    try {
      await sendPush(subscription, payload);
      sentCount++;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await Push.deleteSubscription(sub.id);
      } else {
        console.error("Push error:", err);
      }
    }
  }

  return sentCount;
}
