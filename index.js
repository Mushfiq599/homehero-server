import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet"; 
import { connectDB } from "./db/getDB.js";
import servicesRouter from "./routes/services.routes.js";
import bookingsRouter from "./routes/bookings.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(helmet());
app.use(
  cors({
    origin: [
      "http://localhost:5173", "https://homehero-36a96.web.app"
    ],
    credentials: true,
  })
);
app.use(express.json());
app.get("/", (req, res) => {
  res.status(200).json({
    message: "HomeHero server is running",
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);
app.use((err, req, res, next) => {
  console.error("Server error:", err.stack);
  res.status(500).json({
    message: "Something went wrong on the server",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });