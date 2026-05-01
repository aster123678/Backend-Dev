# Rollback Procedures

1. Use `heroku releases --app peak-ecommerce-platform` to identify the last healthy release.
2. Run `heroku rollback vNN --app peak-ecommerce-platform`.
3. Verify `/health`, `/dashboard`, product page, search, checkout queue, and worker logs.
4. Keep queues paused only if the rollback corrupts order processing. Otherwise allow workers to drain.
5. Do not roll back database migrations that have already transformed production data unless a tested reverse migration exists.
6. If M80 capacity is part of the incident mitigation, keep Atlas scaled up until traffic and queue depth normalize.

