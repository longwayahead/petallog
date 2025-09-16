import dotenv from "dotenv";
import { sendPushToUser, broadcastPush } from "../utils/push.js";

dotenv.config();

const userId = process.argv[2] || null;
const message = process.argv[3] || "plnt rqrs attn";

const payload = {
  title: "Stanley says...",
  body: message,
  icon: "/icons/icon-192.png",
  badge: "/icons/badge-72.png",
  url: "/tasks",
};

(async () => {
  try {
    if (userId) {
      const count = await sendPushToUser(userId, payload);
      console.log(`Sent to ${count} subscription(s) for user "${userId}"`);
    } else {
      const count = await broadcastPush(payload);
      console.log(`Broadcast sent to ${count} subscription(s)`);
    }
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
})();
