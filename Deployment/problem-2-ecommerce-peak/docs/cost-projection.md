# Cost Projection and Optimization

Budget limit: 50,000 USD for the 72-hour peak weekend.

| Item | Peak Plan | Estimated Cost |
| --- | --- | ---: |
| Heroku web dynos | Up to 500 Performance-L, scaled only under load | 28,000 |
| Heroku workers | Up to 100 Performance-M | 5,500 |
| MongoDB Atlas | M80 for peak window plus backup | 7,500 |
| Redis | Premium cache tier | 3,000 |
| CDN and bandwidth | Global static asset delivery | 4,000 |
| Monitoring/SMS/logging | New Relic, logs, alerts | 1,500 |
| Buffer | Reserved | 500 |
| Total | | 50,000 |

Optimization controls:

- Auto-scale down after peak.
- Use CDN and Redis to reduce dyno and database load.
- Cap maximum dynos unless incident commander approves override.
- Review top endpoints hourly and cache safe high-volume reads.

