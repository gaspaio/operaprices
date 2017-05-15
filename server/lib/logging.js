const winston = require('winston')
const expressWinston = require('express-winston')
const config = require('config')

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.get('logger.level'),
      colorize: false
    })
  ]
});

const requestLogger = expressWinston.logger({winstonInstance: logger})

const errLogger = expressWinston.errorLogger({winstonInstance: logger})

module.exports = {logger, requestLogger, errLogger}

