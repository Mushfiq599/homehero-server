import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/getDB.js";

const router = express.Router();

// Create booking
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const booking = req.body;

    // basic validation
    if (!booking?.serviceId || !booking?.userEmail) {
      return res.status(400).json({ message: "serviceId and userEmail required" });
    }

    booking.createdAt = new Date();
    booking.status = "pending";

    const result = await db.collection("bookings").insertOne(booking);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get my bookings by email
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
    res.status(500).json({ message: err.message });
  }
});

// Delete booking
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const id = req.params.id;

    const result = await db.collection("bookings").deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
