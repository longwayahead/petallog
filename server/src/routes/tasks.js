import express from "express";
import { getAllTasks, completeTask, snoozeTask } from "../controllers/tasksController.js";

const router = express.Router();

router.get("/", getAllTasks);               // GET /api/tasks
router.put("/:id/complete", completeTask); // PUT /api/tasks/:id/complete
router.put("/:id/snooze", snoozeTask);   // PUT /api/tasks/:id/snooze
export default router;
