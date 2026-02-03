type RateRecord = { count: number; resetAt: number };

const windowMs = 60_000;
const limit = 60;
const rateMap = new Map<string, RateRecord>();

export function rateLimit(key: string) {
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || record.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { ok: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { ok: true, remaining: limit - record.count };
}
