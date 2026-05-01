const env = process.env.APP_ENV || process.env.NODE_ENV || 'development';

const logLevelByEnv = {
  development: 'debug',
  staging: 'info',
  production: 'error'
};

module.exports = {
  env,
  port: Number(process.env.PORT || 3000),
  databaseUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/transactions_dev',
  logLevel: process.env.LOG_LEVEL || logLevelByEnv[env] || 'info',
  auditLogEnabled: process.env.AUDIT_LOG_ENABLED !== 'false',
  tlsRequired: process.env.TLS_REQUIRED === 'true' || env === 'production',
  featureFlags: {
    fastSettlement: process.env.FEATURE_FAST_SETTLEMENT === 'true'
  },
  healthcheckIntervalMs: Number(process.env.HEALTHCHECK_INTERVAL_MS || 300000)
};

