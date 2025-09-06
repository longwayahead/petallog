import express from "express";
import * as plantsController from "../controllers/plantsController.js";

const router = express.Router();

router.get("/", plantsController.getPlants);        // GET /api/plants
router.get("/:id", plantsController.getPlant);      // GET /api/plants/:id
router.get("/:id/tasks", plantsController.getPendingTasks); // GET /api/plants/:id/tasks
router.get("/:id/preferences", plantsController.getCarePreferences); // GET /api/plants/:id/preferences
router.get("/:id/interactions", plantsController.getInteractions); // GET /api/plants/:id/interactions
router.get("/:id/interactions/max", plantsController.getMaxInteractionid);
router.patch("/:plantId/photo/:photoId", plantsController.setProfilePhoto); // PATCH /api/plants/:plantId/photo/:photoId
router.patch("/:plantId/kill", plantsController.killPlant); // PATCH /api/plants/:plantId/kill
router.post("/:plantId/pot", plantsController.assignPlantPot); // POST /api/plants/:plantId/pots
router.post("/", plantsController.addPlant);        // POST /api/plants

export default router;
