/**
 * Billing — credit balance + webhook idempotency.
 *
 * Single source of truth for everything that touches money. The route
 * handlers in server.js stay thin and just forward to these helpers.
 *
 * Firestore layout:
 *
 *   user_credits/{user_id}
 *     ├── credits                  — integer, scenes worth of paid render
 *     ├── price_per_scene          — USD, derived from the most recent payment
 *     ├── last_payment             — USD of the most recent webhook event
 *     ├── last_payment_at          — serverTimestamp
 *     ├── last_product             — product id from the webhook
 *     ├── last_transaction_id      — for human audit
 *     └── created_at / updated_at
 *
 *   webhook_events/{transaction_id}
 *     ├── transaction_id, user_id, product, amount_paid, scene_count
 *     └── processed_at             — serverTimestamp
 *
 * Idempotency lives in webhook_events. Every credit-grant runs in a
 * Firestore transaction that first reads the event doc; if it exists,
 * the transaction returns "already_processed" without crediting again.
 *
 * Reserve / refund both run as transactions so two concurrent
 * /api/generate-reel calls never double-spend.
 */
import { firestore, FieldValue } from "../infrastructure/firebase.js";

const CREDITS_COLLECTION = "user_credits";
const EVENTS_COLLECTION = "webhook_events";

// Maps a payment provider's product id to how many render credits the
// purchase grants. Edit here when a new SKU lands; no other code needs
// to learn about new product ids.
export const PRODUCT_TO_SCENES = {
  prod_1_scene: 1,
  prod_2_scenes: 2,
  prod_4_scenes: 4,
};

export class InsufficientCreditsError extends Error {
  constructor(currentBalance, required) {
    super(`Insufficient credits: have ${currentBalance}, need ${required}.`);
    this.name = "InsufficientCreditsError";
    this.currentBalance = currentBalance;
    this.required = required;
  }
}

export class UnknownProductError extends Error {
  constructor(product) {
    super(`Unknown billing product: ${product}`);
    this.name = "UnknownProductError";
    this.product = product;
  }
}

/**
 * Process one billing webhook event. Idempotent: if the same
 * transactionId has already been credited, returns
 * { status: "already_processed" } without touching balances.
 *
 * @returns {Promise<{
 *   status: "credited" | "already_processed",
 *   credits_added: number,
 *   new_balance: number,
 *   user_id: string,
 *   transaction_id: string
 * }>}
 */
export async function processWebhookEvent({
  userId,
  product,
  amountPaid,
  transactionId,
}) {
  if (!userId) throw new Error("processWebhookEvent: userId is required");
  if (!product) throw new Error("processWebhookEvent: product is required");
  if (!(Number(amountPaid) > 0)) {
    throw new Error("processWebhookEvent: amountPaid must be > 0");
  }
  if (!transactionId) {
    throw new Error("processWebhookEvent: transactionId is required");
  }
  const sceneCount = PRODUCT_TO_SCENES[product];
  if (!sceneCount) throw new UnknownProductError(product);

  const fs = firestore();
  const eventRef = fs.collection(EVENTS_COLLECTION).doc(transactionId);
  const userRef = fs.collection(CREDITS_COLLECTION).doc(userId);

  return fs.runTransaction(async (tx) => {
    const eventSnap = await tx.get(eventRef);
    if (eventSnap.exists) {
      // Read current balance for the response so the caller can confirm
      // the user already has the credits they paid for.
      const userSnap = await tx.get(userRef);
      const balance = userSnap.exists ? userSnap.get("credits") ?? 0 : 0;
      return {
        status: "already_processed",
        credits_added: 0,
        new_balance: balance,
        user_id: userId,
        transaction_id: transactionId,
      };
    }
    const userSnap = await tx.get(userRef);
    const previous = userSnap.exists ? userSnap.get("credits") ?? 0 : 0;
    const newBalance = previous + sceneCount;
    const pricePerScene =
      Math.round((Number(amountPaid) / sceneCount) * 100) / 100;
    const update = {
      credits: newBalance,
      price_per_scene: pricePerScene,
      last_payment: Number(amountPaid),
      last_payment_at: FieldValue.serverTimestamp(),
      last_product: product,
      last_transaction_id: transactionId,
      updated_at: FieldValue.serverTimestamp(),
    };
    if (!userSnap.exists) update.created_at = FieldValue.serverTimestamp();
    tx.set(userRef, update, { merge: true });
    tx.set(eventRef, {
      transaction_id: transactionId,
      user_id: userId,
      product,
      amount_paid: Number(amountPaid),
      scene_count: sceneCount,
      price_per_scene: pricePerScene,
      processed_at: FieldValue.serverTimestamp(),
    });
    return {
      status: "credited",
      credits_added: sceneCount,
      new_balance: newBalance,
      user_id: userId,
      transaction_id: transactionId,
    };
  });
}

/**
 * Atomically debit `n` credits from a user. Throws InsufficientCreditsError
 * when the balance is too low; never partially debits.
 *
 * @returns {Promise<{ user_id: string, credits_remaining: number, price_per_scene: number|null }>}
 */
export async function reserveCredits(userId, n) {
  if (!userId) throw new Error("reserveCredits: userId is required");
  if (!(n > 0)) throw new Error("reserveCredits: n must be > 0");
  const fs = firestore();
  const userRef = fs.collection(CREDITS_COLLECTION).doc(userId);
  return fs.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const current = snap.exists ? snap.get("credits") ?? 0 : 0;
    if (current < n) {
      throw new InsufficientCreditsError(current, n);
    }
    const remaining = current - n;
    const pricePerScene = snap.exists ? snap.get("price_per_scene") ?? null : null;
    tx.update(userRef, {
      credits: remaining,
      last_consumed_at: FieldValue.serverTimestamp(),
      updated_at: FieldValue.serverTimestamp(),
    });
    return {
      user_id: userId,
      credits_remaining: remaining,
      price_per_scene: pricePerScene,
    };
  });
}

/**
 * Add `n` credits back, e.g. when every scene of a job failed. Best-effort —
 * if the doc somehow doesn't exist, recreate it with the refunded amount
 * so we don't lose the credit silently.
 */
export async function refundCredits(userId, n, reason = null) {
  if (!userId) return;
  if (!(n > 0)) return;
  const fs = firestore();
  const userRef = fs.collection(CREDITS_COLLECTION).doc(userId);
  await fs.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);
    const current = snap.exists ? snap.get("credits") ?? 0 : 0;
    tx.set(
      userRef,
      {
        credits: current + n,
        last_refund_at: FieldValue.serverTimestamp(),
        last_refund_reason: reason,
        updated_at: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  });
  console.log(
    `[BILLING] refunded user_id=${userId} +${n} credits (reason=${reason ?? "n/a"})`,
  );
}

export async function getCreditsBalance(userId) {
  if (!userId) return null;
  const snap = await firestore()
    .collection(CREDITS_COLLECTION)
    .doc(userId)
    .get();
  if (!snap.exists) {
    return { user_id: userId, credits: 0, price_per_scene: null, exists: false };
  }
  const data = snap.data();
  return {
    user_id: userId,
    credits: data.credits ?? 0,
    price_per_scene: data.price_per_scene ?? null,
    last_payment: data.last_payment ?? null,
    last_product: data.last_product ?? null,
    exists: true,
  };
}

export default {
  PRODUCT_TO_SCENES,
  InsufficientCreditsError,
  UnknownProductError,
  processWebhookEvent,
  reserveCredits,
  refundCredits,
  getCreditsBalance,
};
