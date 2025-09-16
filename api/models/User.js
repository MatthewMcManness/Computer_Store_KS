// api/models/User.js
import { getDb } from "../db.js";
import bcrypt from "bcryptjs";

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(user, plain) {
  if (!user?.passwordHash) return false;
  return bcrypt.compare(plain, user.passwordHash);
}

export async function findUserByEmail(email) {
  const db = getDb();
  const norm = String(email).trim().toLowerCase();
  return db.collection("users").findOne({ email: norm });
}

export async function createUser({ email, name, password, roles = [] }) {
  const db = getDb();
  const norm = String(email).trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const doc = {
    email: norm,
    name: name || "",
    passwordHash,
    roles,
    createdAt: new Date(),
  };
  const { insertedId } = await db.collection("users").insertOne(doc);
  return { _id: insertedId, ...doc };
}
