import express from "express";
import { getAllTasks, completeTask } from "../controllers/tasksController.js";

const router = express.Router();

router.get("/", getAllTasks);               // GET /api/tasks
router.put("/:id/complete", completeTask); // PUT /api/tasks/:id/complete

export default router;
