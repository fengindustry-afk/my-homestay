// Best-effort, dependency-free sliding-window rate limiter.
//
// Mirrors the intent of the rawsec Nginx `limit_req` zones. NOTE: on Vercel's
// serverless runtime each instance has its own memory, so this is a deterrent
// that caps abuse per warm instance — not a globally consistent limit. For
// hard guarantees, back it with Upstash Redis instead. Good enough to blunt
// scripted bursts against the /api/* surface.

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key      Unique identity for the caller (e.g. `${ip}:${path}`).
 * @param limit    Max requests allowed within the window.
 * @param windowMs Window length in milliseconds.
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }

  existing.count += 1;
  const ok = existing.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - existing.count),
    resetAt: existing.resetAt,
  };
}

// Opportunistically evict expired buckets so the Map can't grow unbounded.
// Runs at most once per minute, piggy-backed on incoming requests.
let lastSweep = 0;
export function sweepExpired() {
  const now = Date.now();
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}
