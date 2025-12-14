type Bucket = {
  tokens: number;
  lastRefill: number;
};

// Simple in-memory token bucket (best effort, single instance)
const buckets = new Map<string, Bucket>();

export function rateLimit(
  key: string,
  {
    tokens = 5,
    windowMs = 60_000,
    refillTokens = 5,
  }: { tokens?: number; windowMs?: number; refillTokens?: number } = {},
) {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { tokens, lastRefill: now };

  // Refill based on elapsed time
  const elapsed = now - bucket.lastRefill;
  if (elapsed > 0) {
    const toAdd = Math.floor((elapsed / windowMs) * refillTokens);
    if (toAdd > 0) {
      bucket.tokens = Math.min(tokens, bucket.tokens + toAdd);
      bucket.lastRefill = now;
    }
  }

  if (bucket.tokens <= 0) {
    buckets.set(key, bucket);
    return false;
  }

  bucket.tokens -= 1;
  buckets.set(key, bucket);
  return true;
}
