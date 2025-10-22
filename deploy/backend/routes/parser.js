const express = require('express');
const router = express.Router();
const {
  startParser,
  getParserStatus,
  stopParser,
  getParserLogs
} = require('../controllers/parserController');
const { authMiddleware } = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

// Все маршруты только для админа
router.post('/start', authMiddleware, adminCheck, startParser);
router.get('/status', authMiddleware, adminCheck, getParserStatus);
router.post('/stop', authMiddleware, adminCheck, stopParser);
router.get('/logs', authMiddleware, adminCheck, getParserLogs);

module.exports = router;

