import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/getDB.js";

const router = express.Router();

// POST /api/bookings
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const booking = req.body;

    const required = ["serviceId", "userEmail", "bookingDate", "price"];
    const missing = required.filter((k) => !booking?.[k]);
    if (missing.length) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
    }

    if (!ObjectId.isValid(booking.serviceId)) {
      return res.status(400).json({ message: "Invalid serviceId" });
    }

    const doc = {
      ...booking,
      serviceId: booking.serviceId, // keep as string, ok
      price: Number(booking.price),
      createdAt: new Date(),
      status: booking.status || "pending",
    };

    const result = await db.collection("bookings").insertOne(doc);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create booking" });
  }
});

// GET /api/bookings?email=user@mail.com
router.get("/", async (req, res) => {
  try {
    const db = getDB();
    const { email } = req.query;

    if (!email) return res.status(400).json({ message: "email query is required" });

    const data = await db
      .collection("bookings")
      .find({ userEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch bookings" });
  }
});

// DELETE /api/bookings/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid booking id" });

    const result = await db.collection("bookings").deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete booking" });
  }
});

export default router;
