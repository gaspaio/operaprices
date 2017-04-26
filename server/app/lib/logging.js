const winston = require('winston')
const expressWinston = require('express-winston')
const config = require('config')

const logger = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.get('logger.level'),
      colorize: true
    })
  ]
});

const requestLogger = expressWinston.logger({
  winstonInstance: logger
})

let errLogger
if (process.env.NODE_ENV === 'development') {
  const PrettyError = require('pretty-error')
  const pe = new PrettyError()

  errLogger = (err, req, res, next) => {
    console.log(pe.render(err));
    next(err);
  };
} else {
  errLogger = expressWinston.errorLogger({winstonInstance: logger})
}

module.exports = {logger, requestLogger, errLogger}

