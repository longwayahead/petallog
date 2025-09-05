import express from "express";
import * as potsController from "../controllers/potsController.js";

const router = express.Router();

router.get("/empty", potsController.getEmptyPots);

router.get("/:id", potsController.getPotById);
router.post("/", potsController.createPot);
router.post("/assign-qr", potsController.assignQRCodeToPot);
router.post("/:id/free", potsController.freePot);
export default router;