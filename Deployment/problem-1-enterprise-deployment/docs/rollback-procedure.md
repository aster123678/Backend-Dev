# Rollback Procedure

Target recovery time: 5 minutes.

1. Declare rollback in the incident channel and record the change ticket.
2. Stop new production deployment activity.
3. Run `deployment/rollback-production.ps1` with the previous release path, or allow it to select the most recent previous release.
4. Restart IIS and verify `/health`, `/ready`, and `/dashboard`.
5. Confirm transaction processing, authentication, and database connectivity.
6. Keep the failed release artifact for root-cause analysis.
7. Add audit entry with version, operator, approver, start time, end time, and reason.

Database rollback should use forward-fix migrations when possible. If data restore is required, use the MongoDB Atlas daily snapshot with point-in-time restore into a replacement cluster, then switch `MONGODB_URI` after approval.

