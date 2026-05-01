# Peak Incident Response Runbook

## Alert Conditions

- p95 response time greater than 2 seconds for 5 minutes.
- Checkout p95 greater than 3 seconds.
- Search p95 greater than 500 ms.
- Payment gateway circuit open.
- Queue age greater than 2 minutes.
- Cache hit rate below 80%.
- Error rate greater than 1%.

## Actions

1. Acknowledge alert and assign incident commander.
2. Check dashboard, Heroku metrics, Atlas metrics, Redis memory, queue depth, and CDN hit ratio.
3. If web latency is high, increase web dynos or temporarily reduce non-critical personalization.
4. If checkout queue is growing, scale workers and verify payment gateway status.
5. If payment gateway is unavailable, keep accepting orders with `paymentStatus=queued`.
6. If inventory conflicts appear, disable affected SKU and reconcile reservations.
7. Send SMS/customer support update for critical customer-visible issues.

