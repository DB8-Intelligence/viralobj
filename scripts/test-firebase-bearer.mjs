#!/usr/bin/env node
/**
 * End-to-end Firebase-Bearer test for the ViralObj Bridge.
 *
 * What this does:
 *   1. Mints a custom token for a test user via firebase-admin (ADC).
 *   2. Exchanges it for a real ID token via the Identity Toolkit REST
 *      endpoint (signInWithCustomToken) — this requires FIREBASE_API_KEY
 *      from the Web App config in the Firebase Console.
 *   3. Calls POST /api/generate-reel?dry_run=true with
 *      Authorization: Bearer <id-token> and asserts the response.
 *   4. Sleeps 3s then queries Firestore generations to confirm the
 *      mirrored row exists with the right user_id.
 *
 * Required env:
 *   BASE_URL              https://viralobj-bridge-3s77drlfqa-uc.a.run.app
 *   FIREBASE_API_KEY      from Firebase Console → Project Settings → Web App
 *   GCP_PROJECT_ID        viralreel-ai-493701  (so admin SDK auto-detects)
 *
 * Usage:
 *   export BASE_URL="https://viralobj-bridge-3s77drlfqa-uc.a.run.app"
 *   export FIREBASE_API_KEY="AIza..."
 *   export GCP_PROJECT_ID="viralreel-ai-493701"
 *   node scripts/test-firebase-bearer.mjs
 */
import admin from "firebase-admin";

const BASE_URL = process.env.BASE_URL;
const API_KEY = process.env.FIREBASE_API_KEY;
const PROJECT_ID =
  process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

if (!BASE_URL || !API_KEY || !PROJECT_ID) {
  console.error(
    "Missing env. Need BASE_URL, FIREBASE_API_KEY, GCP_PROJECT_ID.",
  );
  process.exit(2);
}

const TEST_UID = `bridge-smoke-${Date.now()}`;
const TEST_EMAIL = `${TEST_UID}@viralobj.test`;

const app = admin.initializeApp({ projectId: PROJECT_ID });

async function step(label, fn) {
  process.stdout.write(`▸ ${label}…`);
  try {
    const out = await fn();
    process.stdout.write(" ok\n");
    return out;
  } catch (err) {
    process.stdout.write(` FAIL\n  ${err?.message ?? err}\n`);
    process.exit(1);
  }
}

const customToken = await step("admin.auth.createCustomToken", () =>
  admin.auth(app).createCustomToken(TEST_UID, {
    email: TEST_EMAIL,
    smoke: true,
  }),
);

const idToken = await step(
  "Identity Toolkit signInWithCustomToken (needs API key)",
  async () => {
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: customToken, returnSecureToken: true }),
      },
    );
    const j = await r.json();
    if (!r.ok || !j.idToken) {
      throw new Error(
        `signInWithCustomToken ${r.status}: ${JSON.stringify(j).slice(0, 300)}`,
      );
    }
    return j.idToken;
  },
);

const reelResp = await step(
  "POST /api/generate-reel?dry_run=true (Bearer)",
  async () => {
    const r = await fetch(`${BASE_URL}/api/generate-reel?dry_run=true`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        niche: "advogado",
        topic: "Como explicar inventário para clientes leigos",
        tone: "dramatic",
        duration: 30,
        objects: ["martelo de juiz", "contrato"],
      }),
    });
    const body = await r.json();
    if (!r.ok || body.mode !== "dry_run") {
      throw new Error(`HTTP ${r.status} body=${JSON.stringify(body).slice(0, 300)}`);
    }
    if (body.cost_guard?.veo_called !== false) {
      throw new Error("cost_guard.veo_called was not false");
    }
    return body;
  },
);

console.log(
  `  → mode=${reelResp.mode} provider_used=${reelResp.provider_used} characters=${reelResp.package?.characters?.length}`,
);

await new Promise((r) => setTimeout(r, 3000));

await step(
  "Firestore generations query (find the mirrored row)",
  async () => {
    const fs = admin.firestore(app);
    const snap = await fs
      .collection("generations")
      .where("user_id", "==", TEST_UID)
      .limit(5)
      .get();
    if (snap.empty) {
      throw new Error(
        "no generations doc found for the test uid — Firestore mirror is broken",
      );
    }
    const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(
      "  → found",
      docs.length,
      "doc(s); first:",
      JSON.stringify(
        {
          id: docs[0].id,
          user_id: docs[0].user_id,
          niche: docs[0].niche,
          mode: docs[0].mode,
          auth_provider: docs[0].auth_provider,
        },
        null,
        2,
      ).slice(0, 400),
    );
    return docs;
  },
);

await step("admin.auth.deleteUser (cleanup)", () =>
  admin.auth(app).deleteUser(TEST_UID).catch(() => {
    // user record only exists if Identity Toolkit promoted the customToken
    // — not always. Swallow to keep cleanup idempotent.
  }),
);

console.log("\nFirebase Bearer end-to-end test passed.");
process.exit(0);
