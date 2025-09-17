import { generateDailyTasks } from "../controllers/tasksController.js";

generateDailyTasks().then(() => {
  console.log("Manual cron run finished.");
  process.exit(0);
}).catch(err => {
  console.error("Error running cron manually:", err);
  process.exit(1);
});
