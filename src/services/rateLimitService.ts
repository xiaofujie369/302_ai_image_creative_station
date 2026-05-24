import Redis from "ioredis";

type Bucket = { count: number; resetAt: number };

const globalBuckets = globalThis as unknown as {
  rateLimitBuckets?: Map<string, Bucket>;
  redisClient?: Redis;
};

function getRedis() {
  if (!process.env.REDIS_URL) return null;
  globalBuckets.redisClient ??= new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    lazyConnect: true,
  });
  return globalBuckets.redisClient;
}

function getMemoryBuckets() {
  globalBuckets.rateLimitBuckets ??= new Map<string, Bucket>();
  return globalBuckets.rateLimitBuckets;
}

export async function rateLimit(input: {
  key: string;
  limit: number;
  windowSeconds?: number;
}) {
  const windowSeconds = input.windowSeconds || 60;
  const redis = getRedis();

  if (redis) {
    try {
      const key = `rate:${input.key}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds);
      const ttl = await redis.ttl(key);
      return {
        ok: count <= input.limit,
        remaining: Math.max(input.limit - count, 0),
        resetIn: ttl > 0 ? ttl : windowSeconds,
      };
    } catch {
      // Fall back to the in-memory limiter if Redis is temporarily unavailable.
    }
  }

  const buckets = getMemoryBuckets();
  const now = Date.now();
  const existing = buckets.get(input.key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(input.key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { ok: true, remaining: input.limit - 1, resetIn: windowSeconds };
  }
  existing.count += 1;
  return {
    ok: existing.count <= input.limit,
    remaining: Math.max(input.limit - existing.count, 0),
    resetIn: Math.ceil((existing.resetAt - now) / 1000),
  };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

export async function assertGenerationRateLimit(request: Request, userId: string) {
  const userLimit = Number(process.env.RATE_LIMIT_GENERATION_PER_MINUTE || 5);
  const ipLimit = Number(process.env.RATE_LIMIT_IP_PER_MINUTE || 10);
  const ip = getClientIp(request);

  const [userResult, ipResult] = await Promise.all([
    rateLimit({ key: `generation:user:${userId}`, limit: userLimit }),
    rateLimit({ key: `generation:ip:${ip}`, limit: ipLimit }),
  ]);

  if (!userResult.ok || !ipResult.ok) {
    throw new Error("RATE_LIMITED");
  }
}
