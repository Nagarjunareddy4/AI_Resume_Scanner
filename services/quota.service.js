// services/quota.service.js
// In-memory quota service for anonymous client IDs.
// Free tier: 2 calls per 24 hours (configurable here)

const DEFAULT_FREE_CALLS = Number(process.env.FREE_CALLS_PER_DAY) || 2;
const DEFAULT_WINDOW_MS = Number(process.env.QUOTA_WINDOW_MS) || 24 * 3600 * 1000; // 24 hours

// Map<clientId, { count: number, windowStart: number }>
const QUOTA_MAP = new Map();

export function _now() {
  return Date.now();
}

export function checkQuota(clientId, { freeCalls = DEFAULT_FREE_CALLS, windowMs = DEFAULT_WINDOW_MS } = {}) {
  try {
    if (!clientId) return { ok: false, error: 'client_id_required' };
    const entry = QUOTA_MAP.get(clientId) || { count: 0, windowStart: 0 };
    const now = _now();
    if (!entry.windowStart || (now - entry.windowStart) > windowMs) {
      return { ok: true, remaining: freeCalls, resetAt: now + windowMs };
    }
    const remaining = Math.max(0, freeCalls - (entry.count || 0));
    return { ok: true, remaining, resetAt: entry.windowStart + windowMs };
  } catch (err) {
    return { ok: false, error: 'internal_error' };
  }
}

export function incrementQuota(clientId, { freeCalls = DEFAULT_FREE_CALLS, windowMs = DEFAULT_WINDOW_MS } = {}) {
  try {
    if (!clientId) return { ok: false, error: 'client_id_required' };
    const now = _now();
    let entry = QUOTA_MAP.get(clientId) || { count: 0, windowStart: 0 };
    if (!entry.windowStart || (now - entry.windowStart) > windowMs) {
      entry = { count: 1, windowStart: now };
    } else {
      entry.count = (entry.count || 0) + 1;
    }
    QUOTA_MAP.set(clientId, entry);
    const remaining = Math.max(0, freeCalls - entry.count);
    return { ok: true, remaining, count: entry.count, windowStart: entry.windowStart };
  } catch (err) {
    return { ok: false, error: 'internal_error' };
  }
}
