// api/models/Organization.js
import { getDb } from "../db.js";
import { ObjectId } from "mongodb";

const ORGS = "orgs";

const toId = (v) => (v && typeof v === "string" ? new ObjectId(v) : v);

const pickOrg = (o) =>
  o && ({
    _id: o._id,
    name: o.name,
    createdAt: o.createdAt,
    createdBy: o.createdBy, // userId (ObjectId)
  });

export async function createOrganization({ name, createdByUserId }) {
  const db = getDb();
  const doc = {
    name: String(name).trim(),
    createdBy: toId(createdByUserId) ?? null,
    createdAt: new Date(),
  };
  const { insertedId } = await db.collection(ORGS).insertOne(doc);
  const saved = await db.collection(ORGS).findOne({ _id: insertedId });
  return pickOrg(saved);
}

export async function findOrgByName(name) {
  const db = getDb();
  const org = await db.collection(ORGS).findOne({ name: String(name).trim() });
  return pickOrg(org);
}

export async function findOrgById(id) {
  const db = getDb();
  const org = await db.collection(ORGS).findOne({ _id: toId(id) });
  return pickOrg(org);
}

export async function listOrgs({ limit = 50, skip = 0 } = {}) {
  const db = getDb();
  const cur = db
    .collection(ORGS)
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const items = await cur.toArray();
  return items.map(pickOrg);
}

export async function deleteOrg(id) {
  const db = getDb();
  const res = await db.collection(ORGS).deleteOne({ _id: toId(id) });
  return res.deletedCount === 1;
}
