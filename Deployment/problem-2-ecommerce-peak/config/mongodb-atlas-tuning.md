# MongoDB Atlas Performance Tuning

## Cluster Plan

- Normal traffic: M60 replica set, auto-scaling storage enabled.
- Peak traffic: scale to M80 before the event and keep it through the 72-hour peak window.
- Regions: deploy multi-region reads in US, Europe, and Asia with nearest-region read preference for catalog/search.
- Backups: continuous backup enabled before peak, snapshot retained after post-peak review.

## Connection Pooling

- Web dynos: max pool size 50 per dyno during normal load.
- Peak: cap pool size to protect Atlas connection limits; scale horizontally with read-heavy cache.
- Checkout and inventory writes use primary.
- Catalog/search reads use secondaryPreferred only when eventual consistency is acceptable.

## Indexes

- `products.slug` unique index for product pages.
- `products.categoryId, products.status, products.price` compound index for listing pages.
- `inventory.sku` unique index.
- `orders.userId, orders.createdAt` compound index.
- TTL index on `cart.expiresAt` with persistent cart backup in Redis.

