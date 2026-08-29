import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import mediaRoutes from "./routes/media.js";
import { authMiddleware } from "./middleware/auth.js";

const app = express();

const PORT = process.env.PORT || 5000;

console.log(process.env.FRONTEND_URL);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "2mb",
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Media Manager API running",
  });
});

app.use("/api/auth", authRoutes);

app.use(
  "/api/media",
  authMiddleware,
  mediaRoutes
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

app.listen(PORT, () => {
  console.log(
    `Media Manager API running on http://localhost:${PORT}`
  );
});