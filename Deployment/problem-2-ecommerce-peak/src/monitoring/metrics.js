const data = {
  requests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  queuedOrders: 0,
  responseTimes: []
};

function middleware(req, res, next) {
  const started = Date.now();
  data.requests += 1;
  res.on('finish', () => {
    data.responseTimes.push(Date.now() - started);
    if (data.responseTimes.length > 5000) data.responseTimes.shift();
  });
  next();
}

function recordCache(hit) {
  if (hit) data.cacheHits += 1;
  else data.cacheMisses += 1;
}

function recordQueuedOrder() {
  data.queuedOrders += 1;
}

function p95() {
  if (data.responseTimes.length === 0) return 0;
  const sorted = [...data.responseTimes].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * 0.95) - 1];
}

function snapshot() {
  const cacheTotal = data.cacheHits + data.cacheMisses;
  return {
    requestsTotal: data.requests,
    p95ResponseMs: p95(),
    cacheHitRate: cacheTotal ? Number(((data.cacheHits / cacheTotal) * 100).toFixed(2)) : 0,
    queuedOrders: data.queuedOrders
  };
}

module.exports = { middleware, recordCache, recordQueuedOrder, snapshot };

