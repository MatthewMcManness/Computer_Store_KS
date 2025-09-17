// api/scripts/seedPlatform.mjs
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { initDb, closeDb } from "../db.js";
import { createUser } from "../models/User.js";

// load api/.env explicitly
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  const email = process.argv[2] || "matthewmcmanness@gmail.com";
  const name  = process.argv[3] || "Matthew McManness";
  const pass  = process.argv[4] || "sd!wmMAD!"; // change if you want

  await initDb();                // IMPORTANT
  try {
    const user = await createUser({
      email,
      name,
      password: pass,
      roles: ["platform"],       // platform owner
    });
    console.log("Created platform user:", {
      id: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });
  } catch (e) {
    console.error("Seed error:", e.message);
  } finally {
    await closeDb();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
