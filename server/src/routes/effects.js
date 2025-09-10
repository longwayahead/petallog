import express from "express";
import * as effectsController from "../controllers/effectsController.js";

const router = express.Router();

router.get("/", effectsController.findEffects); // GET /api/effects/

export default router;