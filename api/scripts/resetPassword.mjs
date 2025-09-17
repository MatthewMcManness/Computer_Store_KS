// api/scripts/resetPassword.mjs
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { initDb, getDb } from "../db.js";
import { findUserByEmail } from "../models/User.js";

// always load api/.env regardless of CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function main() {
  const [emailArg, newPass] = process.argv.slice(2);
  if (!emailArg || !newPass) {
    console.error('Usage: node api/scripts/resetPassword.mjs "<email>" "<newPassword>"');
    process.exit(1);
  }

  const email = String(emailArg).trim().toLowerCase();

  await initDb();
  const db = getDb();

  const user = await findUserByEmail(email);
  if (!user) {
    console.error("No user found with that email");
    process.exit(1);
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(newPass, salt);

  await db.collection("users").updateOne(
    { _id: user._id },
    { $set: { passwordHash } }
  );

  console.log("Password reset OK for:", email);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
