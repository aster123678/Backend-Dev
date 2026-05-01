const express = require('express');
const helmet = require('helmet');
const cache = require('./cache/redisCache');
const checkoutRoutes = require('./routes/checkout');
const metrics = require('./monitoring/metrics');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(helmet());
app.use(express.json());
app.use(metrics.middleware);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', peakMode: process.env.PEAK_MODE === 'true', timestamp: new Date().toISOString() });
});

app.get('/products/:slug', async (req, res, next) => {
  try {
    const result = await cache.remember(`product:${req.params.slug}`, 300, async () => ({
      slug: req.params.slug,
      name: 'Peak sale product',
      cdnImage: `${process.env.CDN_BASE_URL || 'https://cdn.example.com'}/products/${req.params.slug}.jpg`
    }));
    metrics.recordCache(result.hit);
    res.set('cache-control', 'public, max-age=60, stale-while-revalidate=300');
    res.json(result.value);
  } catch (error) {
    next(error);
  }
});

app.use(checkoutRoutes);

app.get('/metrics', (req, res) => {
  const current = metrics.snapshot();
  res.type('text/plain').send([
    `ecommerce_requests_total ${current.requestsTotal}`,
    `ecommerce_p95_response_ms ${current.p95ResponseMs}`,
    `ecommerce_cache_hit_rate ${current.cacheHitRate}`,
    `ecommerce_queued_orders ${current.queuedOrders}`
  ].join('\n'));
});

app.get('/dashboard', (req, res) => {
  res.json({
    title: 'Peak E-Commerce Realtime Dashboard',
    targets: {
      productPageLoad: '< 1 second',
      checkout: '< 3 seconds',
      search: '< 500 ms',
      cacheHitRate: '> 80%',
      staticAssetsFromCdn: '> 90%'
    },
    metrics: metrics.snapshot()
  });
});

app.use((err, req, res, next) => {
  console.error(JSON.stringify({ event: 'request_error', error: err.message, path: req.path }));
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(JSON.stringify({ event: 'server_started', port }));
});

module.exports = app;

