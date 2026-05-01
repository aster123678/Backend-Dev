const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const config = require('./config');
const logger = require('./config/logger');
const database = require('./config/database');
const metrics = require('./monitoring/metricsStore');
const healthRoutes = require('./routes/health');
const metricsRoutes = require('./routes/metrics');

const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: config.env === 'production' ? ['https://company.com'] : true }));
app.use(express.json());
app.use(metrics.middleware);

app.use((req, res, next) => {
  if (config.tlsRequired && req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.status(403).json({ error: 'TLS required' });
  }
  next();
});

app.get('/', (req, res) => {
  res.json({
    service: 'enterprise-transaction-service',
    environment: config.env,
    featureFlags: config.featureFlags
  });
});

app.post('/deployments/audit', (req, res) => {
  logger.audit('deployment_recorded', {
    version: req.body.version,
    approver: req.body.approver,
    environment: config.env
  });
  res.status(202).json({ recorded: true });
});

app.use(healthRoutes);
app.use(metricsRoutes);

app.use((err, req, res, next) => {
  logger.error('request_failed', { error: err.message, path: req.path });
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(config.port, async () => {
  logger.info('server_started', { port: config.port });
  if (process.env.SKIP_DB_CONNECT !== 'true') {
    try {
      await database.connectWithRetry();
    } catch (error) {
      logger.error('startup_database_unavailable', { error: error.message });
    }
  }
});

process.on('SIGTERM', async () => {
  logger.info('shutdown_started');
  server.close(async () => {
    await database.disconnect();
    process.exit(0);
  });
});

module.exports = app;

