import express from "express";
import { toNodeHandler } from "better-auth/node";

import cors from "cors";
import path from "path";

import plantsRoutes from "./routes/plants.js";
import tasksRoutes from "./routes/tasks.js";
import qrRoutes from "./routes/qrcodes.js";
import interactionsRoutes from "./routes/interactions.js";
import actionsRoutes from "./routes/actions.js";
import effectsRoutes from "./routes/effects.js";
import photosRoutes from "./routes/photos.js";
import potsRoutes from "./routes/pots.js";
import { errorHandler } from "./middleware/errorHandler.js";

import { auth } from "./utils/auth.js";

const app = express();

app.use(
  cors({
    origin: "https://petallog.com", // Replace with your frontend's origin
    methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  })
);
app.use(express.json());

app.use(express.urlencoded({ extended: true }));

// Static files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// API routes
app.use("/api/plants", plantsRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/qr", qrRoutes);
app.use("/api/interactions", interactionsRoutes);
app.use("/api/actions", actionsRoutes);
app.use("/api/effects", effectsRoutes);
app.use("/api", photosRoutes);
app.use("/api/pots", potsRoutes);


app.use("/api/auth", async (req, res) => {
  const url = `${req.protocol}://${req.get("host")}${req.originalUrl}`;

  const request = new Request(url, {
    method: req.method,
    headers: req.headers,
    body:
      req.method !== "GET" && req.method !== "HEAD"
        ? JSON.stringify(req.body)
        : undefined,
  });

  const response = await auth.handler(request);
  const text = await response.text();

  response.headers.forEach((value, key) => res.setHeader(key, value));
  res.status(response.status).send(text);
});


// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
