# Test Scenarios

## 1. Deploy to all environments

- Development: run `deployment/deploy-development.ps1`.
- Staging: merge reviewed pull request, then run `deployment/deploy-staging.ps1`.
- Production: deploy packaged release during Saturday/Sunday 02:00-06:00 with QA sign-off.
- Pass criteria: each environment returns HTTP 200 from `/health` and exposes correct `APP_ENV`.

## 2. Verify environment isolation

- Write a development-only test transaction to the dev database.
- Query staging and production clusters for the same ID.
- Pass criteria: record exists only in development.

## 3. Simulate production database failure

- Temporarily block app access to the Atlas production cluster in a test window.
- Verify `/ready` returns 503 and alert fires after two failed checks.
- Restore access and verify recovery without deployment.

