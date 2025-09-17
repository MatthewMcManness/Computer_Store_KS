// api/scripts/checkUser.mjs
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initDb, closeDb } from "../db.js";
import { findUserByEmail } from "../models/User.js";

// always load api/.env regardless of CWD
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node api/scripts/checkUser.mjs <email>");
    process.exit(1);
  }

  await initDb();                // IMPORTANT
  const user = await findUserByEmail(email);
  console.log(user);             // null if not found
  await closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
