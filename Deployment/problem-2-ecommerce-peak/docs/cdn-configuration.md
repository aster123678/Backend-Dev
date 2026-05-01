# CDN Configuration

- Provider: Cloudflare, Fastly, Akamai, or equivalent global CDN.
- Origins: Heroku app for dynamic fallback, object storage for static assets, image service for resized product media.
- Cache static assets for 30 days with immutable file names.
- Cache product images for 24 hours and purge by product ID on media update.
- Enable Brotli, HTTP/2 or HTTP/3, origin shield, and regional edge routing.
- Target: at least 90% of static assets served from CDN during load tests.

Example response headers:

```text
cache-control: public, max-age=2592000, immutable
surrogate-key: product:SKU123 category:shoes
strict-transport-security: max-age=31536000; includeSubDomains
```

