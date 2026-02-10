import express from "express";
import { ObjectId } from "mongodb";
import { getDB } from "../db/getDB.js";

const router = express.Router();

// GET /api/services?limit=6&email=provider@mail.com
router.get("/", async (req, res) => {
  try {
    const db = getDB();

    const query = {};
    if (req.query.email) query.providerEmail = req.query.email;

    const limit = Number(req.query.limit);
    const cursor = db.collection("services").find(query).sort({ createdAt: -1 });

    const data = Number.isFinite(limit) ? await cursor.limit(limit).toArray() : await cursor.toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch services" });
  }
});

// GET /api/services/:id
router.get("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid service id" });

    const service = await db.collection("services").findOne({ _id: new ObjectId(id) });
    if (!service) return res.status(404).json({ message: "Service not found" });

    res.json(service);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch service" });
  }
});

// POST /api/services
router.post("/", async (req, res) => {
  try {
    const db = getDB();
    const service = req.body;

    const required = ["serviceName", "category", "price", "description", "imageURL", "providerName", "providerEmail"];
    const missing = required.filter((k) => !service?.[k]);

    if (missing.length) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
    }

    const doc = {
      ...service,
      price: Number(service.price),
      createdAt: new Date(),
    };

    const result = await db.collection("services").insertOne(doc);
    res.json({ insertedId: result.insertedId });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to create service" });
  }
});

// PATCH /api/services/:id
router.patch("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid service id" });

    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(updates.price);

    delete updates._id;

    const result = await db.collection("services").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to update service" });
  }
});

// DELETE /api/services/:id
router.delete("/:id", async (req, res) => {
  try {
    const db = getDB();
    const { id } = req.params;

    if (!ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid service id" });

    const result = await db.collection("services").deleteOne({ _id: new ObjectId(id) });
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete service" });
  }
});

export default router;
