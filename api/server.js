// api/server.js
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ObjectId } from "mongodb";
import { initDb, getDb } from "./db.js";
import { createUser, findUserByEmail, verifyPassword } from "./models/User.js";
import { addMembership } from "./models/Membership.js";
import { createOrganization } from "./models/Organization.js";
import { signToken, requireAuth, requirePlatform } from "./middleware/auth.js";


dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 4000;



// ---- health ----
app.get("/api/health", async (req, res) => {
  try {
    const db = getDb();
    await db.command({ ping: 1 });
    res.json({ ok: true, dbConnected: true });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- orgs (your existing examples) ----
app.get("/api/orgs", async (req, res) => {
  try {
    const db = getDb();
    const orgs = await db.collection("orgs").find().toArray();
    res.json(orgs);
  } catch (err) {
    console.error("[api] /orgs error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/orgs", async (req, res) => {
  try {
    const db = getDb();
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const result = await db.collection("orgs").insertOne({ name, createdAt: new Date() });
    res.json(result);
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: "Org name already exists" });
    console.error("[api] /orgs POST error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ------------------ NEW: One-time platform registration ------------------ */
app.post("/api/auth/registerPlatform", async (req, res) => {
  const { PLATFORM_SETUP_TOKEN } = process.env;
  const { setupToken, email, name, password } = req.body || {};

  if (!setupToken || setupToken !== PLATFORM_SETUP_TOKEN) {
    return res.status(403).json({ error: "bad setup token" });
  }
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: "user exists" });
  }

  const user = await createUser({ email, name, password, roles: ["platform"] });
  const token = signToken(user);
  res.json({ ok: true, token, user: { id: user._id, email: user.email, roles: user.roles } });
});


// Platform admin: create an organization + its owner user
app.post("/api/admin/createOrgWithOwner", requireAuth, requirePlatform, async (req, res) => {
  const { orgName, ownerName, ownerEmail, password } = req.body || {};
  if (!orgName || !ownerEmail || !password) {
    return res.status(400).json({ error: "orgName, ownerEmail, password required" });
  }

  const org = await createOrganization(orgName);

  let owner = await findUserByEmail(ownerEmail);
  if (!owner) {
    owner = await createUser({ email: ownerEmail, name: ownerName, password });
  }

  await addMembership({ userId: owner._id, orgId: org._id, role: "owner" });

  res.json({
    ok: true,
    org: { id: org._id, name: org.name },
    owner: { id: owner._id, email: owner.email },
  });
});

// LOGIN (real)
app.post("/api/auth/login", async (req, res) => {
  try {
    await initDb();

    let { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "missing fields" });
    }

    // normalize
    email = String(email).trim().toLowerCase();

    console.log("LOGIN attempt", { email });

    const user = await findUserByEmail(email);
    console.log("LOOKUP user ->", !!user ? user.email : null);

    if (!user) {
      return res.status(401).json({ error: "invalid email or password" });
    }

    const ok = await verifyPassword(user, password);
    console.log("PASSWORD match ->", ok);

    if (!ok) {
      return res.status(401).json({ error: "invalid email or password" });
    }

    const token = jwt.sign(
      { sub: String(user._id), roles: user.roles || [] },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: String(user._id),
        email: user.email,
        name: user.name,
        roles: user.roles || [],
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
});

// List Organiztions //
app.get("/api/admin/orgs", requireAuth, requirePlatform, async (req, res) => {
  const orgs = await listOrganizations();
  res.json({ ok: true, orgs });
});


// ---- start ----
app.listen(PORT, async () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  await initDb();
});
