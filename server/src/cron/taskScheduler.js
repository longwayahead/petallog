import cron from "node-cron";
import { generateDailyTasks } from "../controllers/tasksController.js";

// Schedule for 4 AM daily
cron.schedule("0 4 * * *", () => {generateDailyTasks()});
