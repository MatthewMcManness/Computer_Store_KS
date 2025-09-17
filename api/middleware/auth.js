// api/middleware/auth.js
import jwt from "jsonwebtoken";

const { JWT_SECRET } = process.env;

export function signToken(user) {
  return jwt.sign(
    {
      uid: user._id.toString(),
      email: user.email,
      roles: user.roles || [],
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: "missing token" });
  try {
    req.auth = jwt.verify(m[1], JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ error: "invalid token" });
  }
}

export function requirePlatform(req, res, next) {
  if (req.auth?.roles?.includes("platform")) return next();
  return res.status(403).json({ error: "forbidden" });
}
