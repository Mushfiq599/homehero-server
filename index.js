import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./db/getDB.js";
import servicesRouter from "./routes/services.routes.js";
import bookingsRouter from "./routes/bookings.routes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// health
app.get("/", (req, res) => res.send("HomeHero server is running ✅"));

// routes
app.use("/api/services", servicesRouter);
app.use("/api/bookings", bookingsRouter);

// start after db connect
connectDB()
  .then(() => {
    app.listen(port, () => console.log(`✅ Server running: http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("❌ Mongo connection failed:", err.message);
    process.exit(1);
  });
