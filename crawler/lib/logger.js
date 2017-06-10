const winston = require('winston')
const config = require('config')

module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      level: config.get('logger_level'),
      colorize: false
    })
  ]
})
