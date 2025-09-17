// api/models/Membership.js
import { getDb } from "../db.js";
import { ObjectId } from "mongodb";

const MEMBERSHIPS = "memberships";

const toId = (v) => (v && typeof v === "string" ? new ObjectId(v) : v);

const pickMembership = (m) =>
  m && ({
    _id: m._id,
    userId: m.userId,
    orgId: m.orgId,
    role: m.role, // "owner" | "admin" | "technician" | "receptionist"
    createdAt: m.createdAt,
  });

export async function addMembership({ userId, orgId, role }) {
  const db = getDb();
  const filter = { userId: toId(userId), orgId: toId(orgId) };
  const update = {
    $set: { role: String(role) },
    $setOnInsert: { createdAt: new Date() },
  };
  const opts = { upsert: true, returnDocument: "after" };
  const res = await db.collection(MEMBERSHIPS).findOneAndUpdate(filter, update, opts);
  return pickMembership(res.value);
}

export async function removeMembership({ userId, orgId }) {
  const db = getDb();
  const res = await db
    .collection(MEMBERSHIPS)
    .deleteOne({ userId: toId(userId), orgId: toId(orgId) });
  return res.deletedCount === 1;
}

export async function getUserMemberships(userId) {
  const db = getDb();
  const items = await db
    .collection(MEMBERSHIPS)
    .find({ userId: toId(userId) })
    .toArray();
  return items.map(pickMembership);
}

export async function getOrgMembers(orgId) {
  const db = getDb();
  const items = await db
    .collection(MEMBERSHIPS)
    .find({ orgId: toId(orgId) })
    .toArray();
  return items.map(pickMembership);
}

export async function isUserInOrg(userId, orgId) {
  const db = getDb();
  const found = await db
    .collection(MEMBERSHIPS)
    .findOne({ userId: toId(userId), orgId: toId(orgId) });
  return Boolean(found);
}

export async function getUserRoleInOrg(userId, orgId) {
  const db = getDb();
  const m = await db
    .collection(MEMBERSHIPS)
    .findOne({ userId: toId(userId), orgId: toId(orgId) });
  return m?.role ?? null;
}
