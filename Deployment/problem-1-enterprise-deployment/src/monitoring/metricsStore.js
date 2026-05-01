const metrics = {
  startedAt: Date.now(),
  requests: 0,
  errors: 0,
  responseTimes: []
};

function middleware(req, res, next) {
  const started = Date.now();
  metrics.requests += 1;
  res.on('finish', () => {
    const elapsed = Date.now() - started;
    metrics.responseTimes.push(elapsed);
    if (metrics.responseTimes.length > 1000) metrics.responseTimes.shift();
    if (res.statusCode >= 500) metrics.errors += 1;
  });
  next();
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil((p / 100) * sorted.length) - 1];
}

function snapshot() {
  return {
    uptimeSeconds: Math.round((Date.now() - metrics.startedAt) / 1000),
    requestsTotal: metrics.requests,
    errorsTotal: metrics.errors,
    p95ResponseMs: percentile(metrics.responseTimes, 95),
    averageResponseMs: metrics.responseTimes.length
      ? Math.round(metrics.responseTimes.reduce((sum, value) => sum + value, 0) / metrics.responseTimes.length)
      : 0
  };
}

module.exports = { middleware, snapshot };

