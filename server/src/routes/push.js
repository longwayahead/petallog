import express from "express";
import * as pushController from "../controllers/pushController.js";


const router = express.Router();


// Save or update subscription
router.post("/subscribe", pushController.subscribe);

// Remove subscription
router.post("/unsubscribe", pushController.unsubscribe);

// Send to one user
router.post("/send", pushController.sendNotificationToUser);

// Broadcast to all
router.post("/broadcast", pushController.broadcastNotification);

export default router;
