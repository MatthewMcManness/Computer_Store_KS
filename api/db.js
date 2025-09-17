// api/db.js
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

let client = null;
let db = null;

export async function initDb(uri = process.env.MONGODB_URI) {
  if (db) return db;
  if (!uri) throw new Error("MONGODB_URI missing in api/.env");

  client = new MongoClient(uri);
  await client.connect();
  db = client.db("repair_manager");

  // helpful indexes (created once)
  await db.collection("users").createIndex({ email: 1 }, { unique: true });
  await db.collection("memberships").createIndex({ userId: 1 });
  await db.collection("memberships").createIndex({ orgId: 1 });
  await db.collection("orgs").createIndex({ name: 1 }, { unique: true });

  console.log("[db] connected");
  return db;
}

export function getDb() {
  if (!db) throw new Error("DB not initialized. Call initDb() first.");
  return db;
}

export async function closeDb() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("[db] closed");
  }
}
