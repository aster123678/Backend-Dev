# Incident Response Plan

## Severity Levels

- Sev 1: production unavailable, data integrity risk, or transaction processing halted.
- Sev 2: degraded production performance, p95 latency above 200 ms, or partial external dependency failure.
- Sev 3: development or staging outage, warning alerts, or non-critical deployment issue.

## Response Flow

1. Alert triggers from health check, uptime monitor, database alert, or custom metric.
2. On-call engineer acknowledges within 5 minutes.
3. Incident commander opens timeline and assigns roles for communications, diagnosis, and remediation.
4. Check IIS status, application logs, Atlas metrics, deployment audit logs, and recent changes.
5. Roll back if the incident started after a deployment and mitigation is not clear within 10 minutes.
6. Communicate customer impact and ETA every 15 minutes for Sev 1 incidents.
7. Complete post-incident review within 2 business days.

## Required Alerts

- `/health` fails twice in a row.
- p95 response time greater than 200 ms for 5 minutes.
- Error rate greater than 1%.
- MongoDB Atlas primary unavailable or replication lag greater than 30 seconds.
- Backup job failure.

