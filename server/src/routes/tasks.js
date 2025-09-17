import express from "express";
import { getAllTasks, completeTask, snoozeTask, generateDailyTasks } from "../controllers/tasksController.js";

const router = express.Router();

router.get("/", getAllTasks);               // GET /api/tasks
router.put("/:id/complete", completeTask); // PUT /api/tasks/:id/complete
router.post("/:id/snooze", snoozeTask);   // POST /api/tasks/:id/snooze
router.post("/generate", generateDailyTasks);
export default router;
