const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const logging = require('./logging')
const db = require('./db')
const config = require('config')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

app.use(bodyParser.json())


const apiRouter = express.Router();

apiRouter.get('/shows', (req, res) => {
  db.getShows({active: true}).then(ss => res.json(ss))
})

apiRouter.get('shows/:id', (req, res) => {
  // Get a single show by ID
})

app.use(logging.requestLogger)

app.get('/', (req, res) => {
  res.send('hello, world!')
})

app.use('/api', apiRouter)

app.get('*', (req, res, next) => {
  res.status(404).json({
    status: 404,
    message: 'Page not found'
  });
});


app.use(logging.errLogger)

// Internal error handling
app.use((err, req, res, next) => {
  res.status(500).json({
    status:500,
    message: 'Internal error.'
  });
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

