const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const logging = require('./logging')
const db = require('./db')
const config = require('config')
const path = require('path')
const utils = require('./utils')

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development'
}

app.use(bodyParser.json())

// Serve client HTML and JS
app.use(express.static(path.normalize(path.join(__dirname,'..','..','client','dist'))))

const apiRouter = express.Router();

apiRouter.get('/shows', utils.asyncWrapper(async (req, res) => {
  // ?include=lowestActivePrice,tendency&active=false
  // TODO: validate params & param accepted values
  const params = Object.assign({
    include: null,
    active: null,
    saleOpen: null
  }, req.query)

  const includes = params.include !== null ? params.include.split(',') : [];
  ['active', 'saleOpen'].forEach(p => {
    if (params[p] === null) return
    params[p] = params[p] === 'true'
  })

  const response = (lastCrawl, shows) => {
    return {
      meta: {
        lastCrawl: lastCrawl.toObject()
      },
      shows: shows.map(s => s.toObject())
    }
  }

  let shows = await db.getShows(params)

  const lastCrawl = await db.getLastCrawl()

  if (!includes.includes('cheapest') && !includes.includes('tendency')) {
    res.json(response(lastCrawl, shows))
    return
  }

  const priceMaps = await Promise.all(
    shows.map(show => db.getLowestPerformancePrices(show.id))
  )

  shows = shows.map((show, i) => {
    if (includes.includes('cheapest')) {
      show.cheapestPerformances = utils.findCheapestPerformances(priceMaps[i], lastCrawl.time)
    }
    if (includes.includes('tendency')) {
      show.tendency = utils.findCheapestTendency(priceMaps[i])
    }
    return show
  })

  res.json(response(lastCrawl, shows))
}))

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

