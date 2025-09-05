import express from "express";
import * as interactionsController from "../controllers/interactionsController.js";

const router = express.Router();

router.post("/", interactionsController.addInteraction); // POST /api/interactions/
router.patch("/:id", interactionsController.updateInteractionNote); // PATCH /api/interactions/:id
router.delete("/:id", interactionsController.deleteInteraction); // DELETE /api/interactions/:id

export default router;