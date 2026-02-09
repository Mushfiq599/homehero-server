import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ---- MongoDB setup ----
const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "homeheroDB";

if (!uri) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

const client = new MongoClient(uri);

let servicesCollection;
let bookingsCollection;

async function connectMongo() {
  await client.connect();
  const db = client.db(dbName);
  servicesCollection = db.collection("services");
  bookingsCollection = db.collection("bookings");
  console.log("✅ MongoDB connected");
}

// ---- Health ----
app.get("/", (req, res) => {
  res.send("HomeHero server is running ✅");
});

// =====================================================
// SERVICES
// =====================================================

// GET all services (supports: limit, email filter)
app.get("/api/services", async (req, res) => {
  try {
    const query = {};
    const email = req.query.email;
    if (email) query.providerEmail = email;

    const limit = parseInt(req.query.limit);

    const cursor = servicesCollection.find(query);
    const data = Number.isNaN(limit) ? await cursor.toArray() : await cursor.limit(limit).toArray();

    res.send(data);
  } catch (e) {
    res.status(500).send({ message: "Failed to fetch services" });
  }
});

// GET service by id
app.get("/api/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid service id" });

    const data = await servicesCollection.findOne({ _id: new ObjectId(id) });
    if (!data) return res.status(404).send({ message: "Service not found" });

    res.send(data);
  } catch (e) {
    res.status(500).send({ message: "Failed to fetch service" });
  }
});

// POST add service
app.post("/api/services", async (req, res) => {
  try {
    const service = req.body;

    const required = [
      "serviceName",
      "category",
      "price",
      "description",
      "imageURL",
      "providerName",
      "providerEmail"
    ];

    const missing = required.filter((k) => !service?.[k]);
    if (missing.length) {
      return res.status(400).send({ message: `Missing fields: ${missing.join(", ")}` });
    }

    const doc = {
      ...service,
      price: Number(service.price),
      createdAt: new Date()
    };

    const result = await servicesCollection.insertOne(doc);
    res.send({ insertedId: result.insertedId });
  } catch (e) {
    res.status(500).send({ message: "Failed to add service" });
  }
});

// PATCH update service
app.patch("/api/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid service id" });

    const updates = req.body;
    if (updates.price) updates.price = Number(updates.price);

    const result = await servicesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    );

    res.send(result);
  } catch (e) {
    res.status(500).send({ message: "Failed to update service" });
  }
});

// DELETE service
app.delete("/api/services/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid service id" });

    const result = await servicesCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (e) {
    res.status(500).send({ message: "Failed to delete service" });
  }
});

// =====================================================
// BOOKINGS
// =====================================================

// POST booking
app.post("/api/bookings", async (req, res) => {
  try {
    const booking = req.body;

    const required = ["userEmail", "serviceId", "bookingDate", "price"];
    const missing = required.filter((k) => !booking?.[k]);
    if (missing.length) {
      return res.status(400).send({ message: `Missing fields: ${missing.join(", ")}` });
    }

    if (!ObjectId.isValid(booking.serviceId)) {
      return res.status(400).send({ message: "Invalid serviceId" });
    }

    const doc = {
      ...booking,
      price: Number(booking.price),
      serviceId: booking.serviceId,
      createdAt: new Date()
    };

    const result = await bookingsCollection.insertOne(doc);
    res.send({ insertedId: result.insertedId });
  } catch (e) {
    res.status(500).send({ message: "Failed to create booking" });
  }
});

// GET bookings by userEmail
app.get("/api/bookings", async (req, res) => {
  try {
    const email = req.query.email;
    if (!email) return res.status(400).send({ message: "email query required" });

    const data = await bookingsCollection.find({ userEmail: email }).toArray();
    res.send(data);
  } catch (e) {
    res.status(500).send({ message: "Failed to fetch bookings" });
  }
});

// DELETE booking
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (!ObjectId.isValid(id)) return res.status(400).send({ message: "Invalid booking id" });

    const result = await bookingsCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (e) {
    res.status(500).send({ message: "Failed to cancel booking" });
  }
});

// ---- Start server after Mongo connects ----
connectMongo()
  .then(() => {
    app.listen(port, () => console.log(`✅ Server running on http://localhost:${port}`));
  })
  .catch((err) => {
    console.error("❌ Mongo connection failed:", err.message);
    process.exit(1);
  });
