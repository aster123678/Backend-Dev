const express = require('express');
const database = require('../config/database');
const config = require('../config');

const router = express.Router();

router.get('/health', (req, res) => {
  const db = database.status();
  const healthy = db.readyState === 1 || config.env === 'development';
  res.status(healthy ? 200 : 503).json({
    status: healthy ? 'healthy' : 'degraded',
    environment: config.env,
    database: db,
    timestamp: new Date().toISOString()
  });
});

router.get('/ready', (req, res) => {
  const db = database.status();
  res.status(db.readyState === 1 ? 200 : 503).json({ ready: db.readyState === 1 });
});

module.exports = router;

