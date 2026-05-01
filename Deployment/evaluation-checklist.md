# Evaluation Checklist

## Deployment - 25%

- Problem 1 includes IIS production configuration in `problem-1-enterprise-deployment/deployment/web.config`.
- Problem 1 includes Heroku dev/staging configuration in `Procfile` and `app.json`.
- Problem 2 includes Heroku app/runtime configuration and auto-scaling policy files.
- Environment variables are separated by environment and secrets are represented as config vars, not committed secrets.
- Production HTTPS is enforced through IIS rewrite rules and Heroku secure headers.
- Deployment automation scripts are provided for development, staging, production, and peak-event workflows.

## Database Connectivity - 20%

- MongoDB Atlas connection strings are environment-specific.
- Connection pooling, timeout, retry, and graceful shutdown settings are documented and implemented.
- Problem 1 uses separate clusters/databases for dev, staging, and production isolation.
- Problem 2 includes MongoDB Atlas M60 to M80 scale-up guidance and connection-pool settings.

## Monitoring & Logging - 25%

- Health endpoints are implemented for readiness/liveness checks.
- Custom metrics endpoints and dashboard examples are included.
- Log levels differ by environment: debug for development, info for staging, error for production.
- Alerting rules and incident response actions are documented.

## Security - 15%

- TLS is required for production traffic.
- Encryption at rest is required for Atlas and backup storage.
- Secrets are managed through environment variables/Heroku config vars/IIS environment variables.
- Authentication, authorization, audit logging, secure headers, and least-privilege deployment practices are included.

## Scalability & Performance - 15%

- Problem 1 production capacity target is addressed with IIS app pool tuning, metrics, and rollback.
- Problem 2 includes auto-scaling from 10 to 500 dynos, Redis caching, CDN, queues, circuit breakers, and load testing.
- Load-test scenarios are included for 100,000 and 500,000 requests per minute targets.
- Cost projection and post-peak scale-down plan are documented.

