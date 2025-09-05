import express from "express";
import { checkQr } from "../controllers/qrcodesController.js";

const router = express.Router();

router.get("/:code", checkQr);

export default router;