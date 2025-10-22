const parserService = require('../services/parserService');
const { ParserLog } = require('../models');
const logger = require('../utils/logger');

// Запустить парсер
const startParser = async (req, res) => {
  try {
    if (parserService.isRunning) {
      return res.status(400).json({
        success: false,
        message: 'Парсер уже запущен'
      });
    }

    // Запускаем парсер в фоновом режиме
    parserService.start().catch(error => {
      logger.error('Ошибка фонового парсинга', { error: error.message });
    });

    res.status(200).json({
      success: true,
      message: 'Парсер запущен'
    });
  } catch (error) {
    logger.error('Ошибка запуска парсера', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка запуска парсера',
      error: error.message
    });
  }
};

// Получить статус парсера
const getParserStatus = async (req, res) => {
  try {
    const status = parserService.getStatus();
    
    res.status(200).json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Ошибка получения статуса', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения статуса парсера',
      error: error.message
    });
  }
};

// Остановить парсер
const stopParser = async (req, res) => {
  try {
    await parserService.stop();
    
    res.status(200).json({
      success: true,
      message: 'Парсер остановлен'
    });
  } catch (error) {
    logger.error('Ошибка остановки парсера', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка остановки парсера',
      error: error.message
    });
  }
};

// Получить историю запусков парсера
const getParserLogs = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const logs = await ParserLog.findAll({
      limit: parseInt(limit),
      order: [['created_at', 'DESC']]
    });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    logger.error('Ошибка получения логов парсера', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Ошибка получения логов',
      error: error.message
    });
  }
};

module.exports = {
  startParser,
  getParserStatus,
  stopParser,
  getParserLogs
};

