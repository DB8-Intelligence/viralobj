/**
 * dualAuth middleware
 *
 * Two parallel paths to authenticate a caller:
 *
 *   1. Authorization: Bearer <Firebase ID token>     → req.user.provider="firebase"
 *   2. X-Gemini-Key: <GEMINI_AGENT_TOKEN>            → req.user.provider="gemini-key"
 *
 * Priority: if a Bearer header is present, it MUST verify (no silent
 * fallback to the legacy header — a malicious bearer should not be
 * able to kick the request to a permissive backup). If no Bearer is
 * present, the X-Gemini-Key path runs unchanged. Either path populates
 * `req.user = { uid, email, name, provider }` so handlers can persist
 * generations against the right id.
 *
 * On every successful Firebase verification we also upsert a row in
 * the `users` Firestore collection (best-effort — DB failure must
 * not block the request).
 */
import { auth, firestore, FieldValue } from "../infrastructure/firebase.js";

const ANON_USER = {
  uid: "system:gemini-agent",
  email: null,
  name: null,
  provider: "gemini-key",
};

export async function dualAuth(req, res, next) {
  const authz = req.header("Authorization") || req.header("authorization");

  // ── Path 1: Firebase Bearer ───────────────────────────────────────────
  if (authz && /^bearer /i.test(authz)) {
    const token = authz.slice(authz.indexOf(" ") + 1).trim();
    if (!token) {
      return res.status(401).json({
        ok: false,
        success: false,
        error: "INVALID_BEARER_TOKEN",
        message: "Authorization: Bearer header had no token.",
      });
    }
    try {
      const decoded = await auth().verifyIdToken(token);
      req.user = {
        uid: decoded.uid,
        email: decoded.email || null,
        name: decoded.name || decoded.display_name || null,
        provider: "firebase",
      };
      // Best-effort upsert into users collection. Don't await — keep
      // the request fast. Errors are logged but not surfaced.
      upsertUser(req.user).catch((err) =>
        console.warn("[dualAuth] users upsert failed:", err?.message ?? err),
      );
      return next();
    } catch (err) {
      return res.status(401).json({
        ok: false,
        success: false,
        error: "INVALID_BEARER_TOKEN",
        message: `Firebase ID token verification failed: ${err?.message ?? "unknown"}`,
      });
    }
  }

  // ── Path 2: X-Gemini-Key fallback ────────────────────────────────────
  const expected = process.env.GEMINI_AGENT_TOKEN;
  if (!expected) {
    return res.status(500).json({
      success: false,
      error:
        "Server misconfigured: GEMINI_AGENT_TOKEN not set in environment.",
    });
  }
  const provided = req.header("X-Gemini-Key") || req.header("x-gemini-key");
  if (!provided || provided !== expected) {
    return res.status(401).json({
      success: false,
      error:
        "Unauthorized. Provide either X-Gemini-Key header or Authorization: Bearer <firebase-id-token>.",
    });
  }
  req.user = { ...ANON_USER };
  return next();
}

async function upsertUser(user) {
  // Atomic read-then-write so created_at is set exactly once across
  // concurrent first-time logins. Subsequent calls only refresh the
  // last_seen_at + email + name fields.
  const fs = firestore();
  const ref = fs.collection("users").doc(user.uid);
  await fs.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const now = FieldValue.serverTimestamp();
    const update = {
      uid: user.uid,
      email: user.email,
      name: user.name,
      last_seen_at: now,
    };
    if (!snap.exists) update.created_at = now;
    tx.set(ref, update, { merge: true });
  });
}

export default dualAuth;
