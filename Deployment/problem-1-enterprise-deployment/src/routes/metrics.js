const express = require('express');
const metrics = require('../monitoring/metricsStore');

const router = express.Router();

router.get('/metrics', (req, res) => {
  const data = metrics.snapshot();
  res.type('text/plain').send([
    '# HELP app_requests_total Total HTTP requests',
    '# TYPE app_requests_total counter',
    `app_requests_total ${data.requestsTotal}`,
    '# HELP app_errors_total Total HTTP 5xx responses',
    '# TYPE app_errors_total counter',
    `app_errors_total ${data.errorsTotal}`,
    '# HELP app_response_p95_ms P95 response time in milliseconds',
    '# TYPE app_response_p95_ms gauge',
    `app_response_p95_ms ${data.p95ResponseMs}`
  ].join('\n'));
});

router.get('/dashboard', (req, res) => {
  const data = metrics.snapshot();
  res.json({
    title: 'Enterprise Transaction Service Dashboard',
    objectives: {
      p95ResponseMs: '< 200',
      productionCapacity: '10,000 requests/minute',
      healthChecks: 'every 5 minutes'
    },
    metrics: data
  });
});

module.exports = router;

