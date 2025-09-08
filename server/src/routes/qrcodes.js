import express from "express";
import {
    checkQr,
    generateCodes,
    fetchBatch,
    fetchBatchPdf,
} from "../controllers/qrcodesController.js";

const router = express.Router();

router.get("/batch", fetchBatch);
router.get("/batch/pdf", fetchBatchPdf);
router.get("/:code", checkQr);
router.post("/generate", generateCodes);




export default router;