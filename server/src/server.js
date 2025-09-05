import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";

import plantsRoutes from "./routes/plants.js";
import tasksRoutes from "./routes/tasks.js";
import qrRoutes from "./routes/qrcodes.js";
import interactionsRoutes from "./routes/interactions.js";
import actionsRoutes from "./routes/actions.js";
import photosRoutes from "./routes/photos.js";
import potsRoutes from "./routes/pots.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Static
app.use("/uploads", express.static(path.join(process.cwd(),"uploads")));

// Routes
app.use("/api/plants", plantsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api", photosRoutes);
app.use("/api/pots", potsRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => console.log(`🚀 Server running on port ${PORT}`));
