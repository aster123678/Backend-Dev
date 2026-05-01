const mongoose = require('mongoose');
const config = require('./index');
const logger = require('./logger');

const options = {
  maxPoolSize: config.env === 'production' ? 100 : 20,
  minPoolSize: config.env === 'production' ? 10 : 2,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  appName: `transaction-service-${config.env}`
};

async function connectWithRetry(attempt = 1) {
  try {
    await mongoose.connect(config.databaseUri, options);
    logger.info('database_connected', { pool: options.maxPoolSize });
  } catch (error) {
    logger.error('database_connection_failed', { attempt, error: error.message });
    if (attempt >= 5) throw error;
    await new Promise((resolve) => setTimeout(resolve, attempt * 2000));
    return connectWithRetry(attempt + 1);
  }
}

async function disconnect() {
  await mongoose.connection.close(false);
  logger.info('database_disconnected');
}

function status() {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    name: mongoose.connection.name
  };
}

module.exports = { connectWithRetry, disconnect, status };

