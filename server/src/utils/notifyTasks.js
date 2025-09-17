import dotenv from "dotenv";
import { broadcastPush } from "./push.js";
import { countPendingTasks } from "../models/tasksModel.js";
import { log, logError } from "../cron/logger.js";

dotenv.config();

const basePayload = {
  title: "Stanley says...",
  icon: "https://petallog.com/icons/icon-192.png",
  badge: "https://petallog.com/icons/badge-72.png",
  url: "/tasks",
};

export async function notifyPendingTasks() {
  try {
    const count = await countPendingTasks();

    if (count > 0) {
      const payload = {
        ...basePayload,
        body: `${count} tsk pndng`,
      };

      const sent = await broadcastPush(payload);
      log(`Broadcast sent to ${sent} subscription(s) with ${count} task(s).`);
    } else {
      log("No pending tasks. Skipping push notification.");
    }
  } catch (err) {
    logError("Fatal error in notifyTasks:", err);
  }
}
