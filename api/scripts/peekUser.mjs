// api/scripts/peekUser.mjs
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env") });

import { initDb, closeDb } from "../db.js";
import { findUserByEmail } from "../models/User.js";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.log("Usage: node api/scripts/peekUser.mjs <email>");
    process.exit(1);
  }
  await initDb();
  const u = await findUserByEmail(email);
  console.log(u);
  await closeDb();
}
main().catch(e => { console.error(e); process.exit(1); });
