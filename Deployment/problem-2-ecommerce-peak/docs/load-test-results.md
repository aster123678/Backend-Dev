# Load Testing Scripts and Expected Results

The load script is `load-tests/black-friday-k6.js`.

## 100,000 requests per minute

- Expected auto-scaling trigger: web dynos scale above baseline.
- Pass criteria: p95 under 2 seconds, error rate below 1%, cache hit rate above 80%.
- Expected database behavior: Atlas CPU below 70% because product reads are cached.

## 500,000 requests per minute

- Expected capacity: up to 500 web dynos, M80 Atlas cluster, Redis premium tier, CDN serving over 90% of static assets.
- Pass criteria: checkout accepted with HTTP 202, queue age below 2 minutes, payment failures queued.
- Expected follow-up: tune indexes and cache keys based on the slowest endpoints.

## Failure Simulations

- Payment gateway failure: point `PAYMENT_GATEWAY_URL` to a failing endpoint and verify queued orders.
- Inventory contention: run concurrent checkout calls for a low-stock SKU and verify reservation logic prevents overselling.
- CDN validation: inspect CDN analytics for static asset offload above 90%.

