const express = require('express')
const app = express()
const db = require('./db')
const bodyParser = require('body-parser')
const logging = require('./logging')
const config = require('config')
const path = require('path')
const apiRouter = require('./api')
const cors = require('cors')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

app.use(bodyParser.json())
app.use(cors())

// Serve client HTML and JS
app.use(express.static(path.normalize(path.join(__dirname, '..', '..', 'client', 'dist'))))

app.use(logging.requestLogger)

app.get('/', (req, res) => {
  res.send('hello, world!')
})

app.use('/api', apiRouter)

app.get('*', (req, res, next) => {
  res.status(404).json({
    status: 404,
    message: 'Page not found'
  })
})

app.use(logging.errLogger)

// Internal error handling
app.use((err, req, res, next) => { // eslint-disable-line handle-callback-err
  res.status(500).json({
    status: 500,
    message: 'Internal error.'
  })
})

module.exports.start = () => {
  db.open()
    .then(() => {
      app.listen(config.get('server.port'))
      logging.logger.info(`App listening on port ${config.get('server.port')}`)
    })
    .catch(err => {
      logging.logger.error(err)
    })
}
