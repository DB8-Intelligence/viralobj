/**
 * Firebase Admin bootstrap — ADC only, never accepts a service account JSON
 * argument. On Cloud Run / App Engine the runtime SA is used automatically;
 * locally, run `gcloud auth application-default login` once.
 *
 * Lazy init: importing this module never opens a connection. Each
 * factory (auth/firestore) initializes the default app on first use,
 * so /health and /readyz remain instant on cold start.
 */
import admin from "firebase-admin";

let _app = null;

function getApp() {
  if (_app) return _app;
  if (admin.apps.length > 0) {
    _app = admin.apps[0];
    return _app;
  }
  const projectId =
    process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error(
      "Firebase Admin: GCP_PROJECT_ID (or GOOGLE_CLOUD_PROJECT) is required.",
    );
  }
  _app = admin.initializeApp({ projectId });
  return _app;
}

export function auth() {
  return admin.auth(getApp());
}

export function firestore() {
  return admin.firestore(getApp());
}

// Re-export the FieldValue helper so callers can use serverTimestamp()
// without taking a separate dependency on the firebase-admin module.
export const FieldValue = admin.firestore.FieldValue;

export default { auth, firestore, FieldValue };
