# Multi-Environment Deployment Strategy

Development and staging run on Heroku so teams can deploy and validate quickly. Production runs on IIS for the on-premises requirement. Each environment has a separate MongoDB Atlas cluster, separate credentials, separate config vars, and separate deployment approvals.

## Workflow

- Development: developers can deploy any branch to the dev Heroku app.
- Staging: deployment requires reviewed and approved code.
- Production: deployment requires QA sign-off, change ticket, release artifact, and weekend 02:00-06:00 maintenance window.

## Security Controls

- TLS is mandatory in production through IIS HTTPS redirect and HSTS.
- Atlas encryption at rest is enabled for every cluster.
- Production backups run daily with 30-day retention.
- Audit logs record deployment version, approver, operator, and timestamp.
- Secrets are configured outside source control through Heroku config vars or IIS environment variables.

## Performance Controls

- IIS uses four node processes with 2,048 max concurrent requests per process.
- MongoDB production pool size is 100 connections.
- Metrics track request count, error count, and p95 response time.
- Production target is 10,000 requests per minute with p95 under 200 ms.

