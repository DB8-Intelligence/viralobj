/**
 * Runtime mode helpers — central place for "are we in local-dev mock mode?"
 * checks. Every code path that would otherwise call a paid Google Cloud
 * service consults these guards.
 *
 * The boot guard in server.js refuses to start when NODE_ENV=production
 * and any MOCK_* flag is true, so these checks are safe in deployed code:
 * if mocks ever leak to production, the bridge crashes loudly instead of
 * quietly handing back fake data.
 */

const truthy = (v) => v === "true" || v === true || v === "1";

export const isLocalDev = () => truthy(process.env.LOCAL_DEV_MODE);
export const isMockVertex = () => truthy(process.env.MOCK_VERTEX);
export const isMockFirestore = () => truthy(process.env.MOCK_FIRESTORE);
export const isMockStorage = () => truthy(process.env.MOCK_STORAGE);
export const isMockBilling = () => truthy(process.env.MOCK_BILLING);
export const isMockAuth = () => truthy(process.env.MOCK_AUTH);

export const anyMockEnabled = () =>
  isLocalDev() ||
  isMockVertex() ||
  isMockFirestore() ||
  isMockStorage() ||
  isMockBilling() ||
  isMockAuth();

export default {
  isLocalDev,
  isMockVertex,
  isMockFirestore,
  isMockStorage,
  isMockBilling,
  isMockAuth,
  anyMockEnabled,
};
