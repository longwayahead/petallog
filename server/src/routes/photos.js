import express from "express";
import { upload } from "../middleware/upload.js";
import {
  uploadPhotos,
  deletePhoto,
  listInteractionPhotos,
  listPlantPhotos,
} from "../controllers/photosController.js";

const router = express.Router();

// GET photos by interaction
router.get("/interactions/:id/photos", listInteractionPhotos);

// GET photos by plant
router.get("/plants/:plantId/photos", listPlantPhotos);

// POST new photo(s) for interaction
router.post("/interactions/:id/photos", upload.array("photos", 10), uploadPhotos);

// DELETE photo
router.delete("/photos/:id", deletePhoto);

export default router;
