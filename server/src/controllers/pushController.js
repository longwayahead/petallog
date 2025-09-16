import * as Push from "../models/pushModel.js";
import { sendPushToUser, broadcastPush } from "../utils/push.js";
import { auth } from "../utils/auth.js";

// Save subscription (userId comes from better-auth session)
export async function subscribe(req, res) {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session || !session.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const userId = session.user.id;
    const { subscription } = req.body;
    if (!subscription) {
      return res.status(400).json({ error: "Missing subscription" });
    }

    await Push.saveSubscription(userId, subscription);
    res.json({ success: true });
  } catch (err) {
    console.error("Error saving subscription:", err);
    res.status(500).json({ error: "Failed to save subscription" });
  }
}

// Remove a subscription by endpoint
export async function unsubscribe(req, res) {
  try {
    const { endpoint } = req.body;
    if (!endpoint) {
      return res.status(400).json({ error: "Missing endpoint" });
    }

    await Push.deleteByEndpoint(endpoint);
    res.json({ success: true });
  } catch (err) {
    console.error("Error unsubscribing:", err);
    res.status(500).json({ error: "Failed to unsubscribe" });
  }
}

// Send to a single user (admin/internal usage)
export async function sendNotificationToUser(req, res) {
  const { userId, payload } = req.body;
  if (!userId || !payload) {
    return res.status(400).json({ error: "Missing userId or payload" });
  }
  try {
    const count = await sendPushToUser(userId, payload);
    res.json({ success: true, sent: count });
  } catch (err) {
    console.error("Error sending push:", err);
    res.status(500).json({ error: "Failed to send push" });
  }
}

// Broadcast (admin/internal usage)
export async function broadcastNotification(req, res) {
  const { payload } = req.body;
  if (!payload) {
    return res.status(400).json({ error: "Missing payload" });
  }
  try {
    const count = await broadcastPush(payload);
    res.json({ success: true, sent: count });
  } catch (err) {
    console.error("Error broadcasting push:", err);
    res.status(500).json({ error: "Failed to broadcast push" });
  }
}
