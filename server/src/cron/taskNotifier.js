import cron from "node-cron";
import { notifyPendingTasks } from "../utils/notifyTasks.js";

cron.schedule("0 20 * * *", () => {
  console.log("Running nightly task notification job...");
  notifyPendingTasks();
});
