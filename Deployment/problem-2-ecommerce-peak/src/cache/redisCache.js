const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
  lazyConnect: true
});

async function getJson(key) {
  const value = await redis.get(key);
  return value ? JSON.parse(value) : null;
}

async function setJson(key, value, ttlSeconds = Number(process.env.CACHE_TTL_SECONDS || 120)) {
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

async function remember(key, ttlSeconds, loader) {
  const cached = await getJson(key);
  if (cached) return { value: cached, hit: true };
  const value = await loader();
  await setJson(key, value, ttlSeconds);
  return { value, hit: false };
}

module.exports = { redis, getJson, setJson, remember };

