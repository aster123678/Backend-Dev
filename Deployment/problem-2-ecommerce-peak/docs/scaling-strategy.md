# Scaling Strategy

Normal traffic is 10,000 requests per minute. Peak traffic is 500,000 requests per minute, so the platform scales horizontally on Heroku and shifts read traffic to Redis and CDN wherever possible.

## Heroku

- Start weekend with 10 Performance-L web dynos and 4 Performance-M workers.
- Auto-scale web dynos up to 500 using p95 response time, requests per minute, and queue depth.
- Auto-scale workers up to 100 when checkout queue depth grows.
- Cooldown windows prevent rapid scale thrashing.
- Scale down to normal levels after Tuesday 06:00 and post-peak validation.

## Data Layer

- MongoDB Atlas M60 before event, M80 during peak.
- Redis caches product pages, category pages, search facets, carts, and inventory reservation tokens.
- CDN serves static assets and product images with a target of more than 90% static asset offload.

## Resilience

- Payment gateway calls use a circuit breaker.
- Orders are queued if payment is unavailable.
- Shopping carts are stored in Redis with durable cart snapshots in MongoDB.
- Inventory reservations are short-lived atomic records to prevent overselling.

