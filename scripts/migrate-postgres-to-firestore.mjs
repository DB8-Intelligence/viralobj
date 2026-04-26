#!/usr/bin/env node
/**
 * Postgres → Firestore one-shot migration.
 *
 * Reads `niches` (and the profession subset) from Cloud SQL and writes
 * to the matching Firestore collections using slug as document id with
 * merge:true, so re-running is safe and idempotent.
 *
 * Two ways to run this:
 *
 *   1. Locally with Cloud SQL Auth Proxy:
 *        cloud-sql-proxy viralreel-ai-493701:us-central1:viralobj-db --port=5433 &
 *        export DB_HOST=127.0.0.1 DB_PORT=5433
 *        export DB_USER=viralobj_app DB_NAME=viralobj
 *        export DB_PASS="$(grep '^DB_PASS=' ~/.viralobj-bootstrap-secrets.txt | cut -d= -f2)"
 *        export GCP_PROJECT_ID=viralreel-ai-493701
 *        node scripts/migrate-postgres-to-firestore.mjs
 *
 *   2. Inside the Cloud Run revision via the admin endpoint:
 *        curl -X POST -H "X-Gemini-Key: $GEMINI_AGENT_TOKEN" \
 *             "$BASE_URL/api/admin/migrate-niches-to-firestore"
 *      (server.js imports the migrate() function exported below.)
 */
import db from "../src/infrastructure/database.js";
import { firestore, FieldValue } from "../src/infrastructure/firebase.js";

/**
 * Idempotent niche migration.
 * Returns counts the caller can render in a response.
 *
 * @returns {Promise<{niches: number, professionals: number, skipped: number}>}
 */
export async function migrate() {
  const fs = firestore();
  const rows = await db.getNiches({ includeInactive: true });
  if (!Array.isArray(rows)) {
    throw new Error("db.getNiches returned a non-array result");
  }

  let nichesCount = 0;
  let professionalsCount = 0;
  let skipped = 0;

  // Firestore allows up to 500 ops per batch. Our 36 niches fit in one,
  // but written in chunks to keep the pattern reusable.
  for (let i = 0; i < rows.length; i += 400) {
    const slice = rows.slice(i, i + 400);
    const batch = fs.batch();
    for (const row of slice) {
      if (!row?.key) {
        skipped += 1;
        continue;
      }
      const niche = shapeForFirestore(row);
      batch.set(fs.collection("niches").doc(row.key), niche, { merge: true });
      nichesCount += 1;

      // Mirror the profession subset into a dedicated collection so the
      // future "professional portal" queries stay focused.
      if (row.category === "profissoes") {
        batch.set(
          fs.collection("professionals").doc(row.key),
          {
            slug: row.key,
            name: row.name_pt || row.key,
            name_en: row.name_en || null,
            category: row.category,
            description: row.prompts_base || null,
            active: row.is_active !== false,
            source: "postgres-migration",
            created_at: FieldValue.serverTimestamp(),
            updated_at: FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        professionalsCount += 1;
      }
    }
    await batch.commit();
  }

  return { niches: nichesCount, professionals: professionalsCount, skipped };
}

function shapeForFirestore(row) {
  return {
    slug: row.key,
    name: row.name_pt || row.key,
    name_pt: row.name_pt || null,
    name_en: row.name_en || null,
    emoji: row.emoji ?? null,
    category: row.category,
    description: row.prompts_base ?? null,
    tone_default: row.tone_default ?? "educational",
    objects: Array.isArray(row.objects) ? row.objects : [],
    active: row.is_active !== false,
    source: "postgres-migration",
    // server timestamps so the docs are comparable across migration runs.
    created_at: FieldValue.serverTimestamp(),
    updated_at: FieldValue.serverTimestamp(),
  };
}

// Allow running directly: `node scripts/migrate-postgres-to-firestore.mjs`.
import { fileURLToPath } from "url";
const isDirect = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirect) {
  try {
    const out = await migrate();
    console.log(`Migrated niches:        ${out.niches}`);
    console.log(`Migrated professionals: ${out.professionals}`);
    if (out.skipped) console.log(`Skipped (no slug):      ${out.skipped}`);
    console.log("Done.");
    process.exit(0);
  } catch (err) {
    console.error("Migration failed:", err?.stack ?? err);
    process.exit(1);
  }
}

export default { migrate };
