import webpush from "web-push";
import pool from "../config/db.js";

webpush.setVapidDetails(
  "mailto:stanley@petallog.com",
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Send a push notification to a subscription
 */
export async function sendPush(subscription, payload) {
  return webpush.sendNotification(subscription, JSON.stringify(payload));
}

/**
 * Send notification(s) to one user
 */
export async function sendPushToUser(userId, payload) {
  const [subs] = await pool.query(
    `SELECT id, endpoint, p256dh, auth
     FROM push_subscriptions
     WHERE user_id = ?`,
    [userId]
  );

  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    try {
      await sendPush(subscription, payload);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await pool.query("DELETE FROM push_subscriptions WHERE id = ?", [sub.id]);
      } else {
        console.error("Push error:", err);
      }
    }
  }
  return subs.length;
}

/**
 * Broadcast to all users
 */
export async function broadcastPush(payload) {
  const [subs] = await pool.query(
    `SELECT id, endpoint, p256dh, auth FROM push_subscriptions`
  );

  for (const sub of subs) {
    const subscription = {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth },
    };

    try {
      await sendPush(subscription, payload);
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        await pool.query("DELETE FROM push_subscriptions WHERE id = ?", [sub.id]);
      } else {
        console.error("Push error:", err);
      }
    }
  }
  return subs.length;
}
