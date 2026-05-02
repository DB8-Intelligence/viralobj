/**
 * Firestore-first repository layer.
 *
 * This module owns every read against the niches/professionals/
 * generation_history collections. It intentionally does NOT touch
 * Postgres — callers that need a fallback wrap these reads in a
 * try/catch and call the Cloud SQL helpers in src/infrastructure/database.js.
 *
 * Why not bake the fallback in here? Keeping each datastore behind
 * a single-source-of-truth module makes the migration auditable:
 * the only place that asks Firestore for a niche is this file, and
 * the only file that asks Postgres is database.js. The orchestration
 * (which one wins, what the response says) lives in the route handlers.
 */
import { firestore, FieldValue } from "./firebase.js";

const NICHES_COLLECTION = "niches";
const HISTORY_COLLECTION = "generation_history";

/**
 * List niches from Firestore. Mirrors the lookup contract that
 * server.js's /api/niches expects so callers can swap data sources
 * without massaging the response shape.
 *
 * @param {object}  [opts]
 * @param {?string} [opts.category]       — "profissoes" | "lifestyle" | null (all)
 * @param {"pt"|"en"} [opts.lang="pt"]    — picks display name + sample-object language
 * @param {boolean} [opts.includeInactive=false]
 * @returns {Promise<{niches: object[], categories: string[], count: number}>}
 */
export async function getNichesFromFirestore({
  category = null,
  lang = "pt",
  includeInactive = false,
} = {}) {
  let query = firestore().collection(NICHES_COLLECTION);
  if (!includeInactive) query = query.where("active", "==", true);
  if (category) query = query.where("category", "==", category);

  const snap = await query.get();
  if (snap.empty) {
    return { niches: [], categories: [], count: 0 };
  }

  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Stable, deterministic sort — Firestore's orderBy needs composite
  // indexes for multi-field, but we already have everything in memory
  // so sort here for free.
  docs.sort((a, b) => {
    const ca = (a.category || "").localeCompare(b.category || "");
    if (ca !== 0) return ca;
    const na = lang === "en" ? a.name_en || a.name : a.name_pt || a.name;
    const nb = lang === "en" ? b.name_en || b.name : b.name_pt || b.name;
    return (na || "").localeCompare(nb || "");
  });

  const niches = docs.map((n) => ({
    key: n.slug || n.id,
    name: lang === "en" ? n.name_en || n.name : n.name_pt || n.name,
    emoji: n.emoji ?? null,
    category: n.category,
    objects_count: Array.isArray(n.objects) ? n.objects.length : 0,
    tone_default: n.tone_default ?? "educational",
    sample_objects: (Array.isArray(n.objects) ? n.objects.slice(0, 3) : []).map(
      (o) => (lang === "en" ? o.en || o.id || o.pt : o.pt || o.id || o.en),
    ),
  }));
  const categories = [...new Set(niches.map((n) => n.category))];
  return { niches, categories, count: niches.length };
}

/**
 * Single-doc lookup for /api/generate-reel. Returns null when the slug
 * isn't in Firestore — callers fall through to Postgres / in-memory.
 *
 * @param {string} slug
 * @returns {Promise<object|null>}
 */
export async function getNicheBySlugFromFirestore(slug) {
  if (!slug) return null;
  const ref = firestore().collection(NICHES_COLLECTION).doc(slug);
  const doc = await ref.get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

/**
 * Append-only write into the generation_history collection. Keeps the
 * existing fire-and-forget contract (errors logged, never thrown) so
 * /api/generate-reel can keep calling this without try/catch boilerplate.
 *
 * @param {object} data — already shaped by the caller; we just stamp
 *                        created_at and persist.
 * @returns {Promise<string|null>} doc id when persisted, null when failed.
 */
export async function saveGenerationHistoryToFirestore(data) {
  try {
    const ref = await firestore().collection(HISTORY_COLLECTION).add({
      ...data,
      created_at: FieldValue.serverTimestamp(),
    });
    return ref.id;
  } catch (err) {
    console.warn(
      "[firestoreRepository] generation_history.add failed:",
      err?.message ?? err,
    );
    return null;
  }
}

export default {
  getNichesFromFirestore,
  getNicheBySlugFromFirestore,
  saveGenerationHistoryToFirestore,
};
