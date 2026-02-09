import dotenv from "dotenv";
import { MongoClient } from "mongodb";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || "homeheroDB";

if (!uri) {
  console.error("❌ MONGO_URI missing in .env");
  process.exit(1);
}

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);
    const servicesCol = db.collection("services");

    const jsonPath = path.join(__dirname, "services.json");
    const raw = fs.readFileSync(jsonPath, "utf-8");
    const services = JSON.parse(raw);

    // Clear old seeded records only (safe)
    await servicesCol.deleteMany({ providerEmail: "seed@homehero.com" });

    const result = await servicesCol.insertMany(services);
    console.log(`✅ Seeded ${result.insertedCount} services`);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
  } finally {
    await client.close();
  }
}

seed();
