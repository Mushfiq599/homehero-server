import { MongoClient, ServerApiVersion } from "mongodb";

let client;
let db;

export async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME || "homeheroDB";

  if (!uri) throw new Error("MONGO_URI missing in .env");

  client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  await client.connect();
  db = client.db(dbName);

  console.log("✅ MongoDB connected:", dbName);
  return db;
}

export function getDB() {
  if (!db) throw new Error("DB not initialized. Did you call connectDB()?");
  return db;
}
