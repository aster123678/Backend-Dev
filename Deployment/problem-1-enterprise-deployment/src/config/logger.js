const config = require('./index');

const priorities = { debug: 10, info: 20, warn: 30, error: 40 };

function write(level, message, meta = {}) {
  if (priorities[level] < priorities[config.logLevel]) return;
  const entry = {
    level,
    message,
    environment: config.env,
    timestamp: new Date().toISOString(),
    ...meta
  };
  console.log(JSON.stringify(entry));
}

module.exports = {
  debug: (message, meta) => write('debug', message, meta),
  info: (message, meta) => write('info', message, meta),
  warn: (message, meta) => write('warn', message, meta),
  error: (message, meta) => write('error', message, meta),
  audit: (action, meta = {}) => {
    if (!config.auditLogEnabled) return;
    write('info', 'audit_event', { action, audit: true, ...meta });
  }
};

