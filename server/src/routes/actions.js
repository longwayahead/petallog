import express from "express";
import * as actionsController from "../controllers/actionsController.js";

const router = express.Router();

router.get("/", actionsController.findActions); // GET /api/actions/

export default router;