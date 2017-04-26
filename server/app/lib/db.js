const path = require('path')
const config = require('config')
const db = require('sqlite')
const logging = require('./logging')
const Show = require('../models/Show'
)
const basePath = path.join('__dirname', '..', 'db')

module.exports.open = () => {
  return Promise.resolve()
    .then(() => db.open(path.join(basePath, config.get('db.name'))))
  //.then(() => db.migrate({force: false, migrationsPath: path.join(basePath, 'migrations')}))
}

module.exports.db = db

module.exports.getShows = async () => {
  const rows = await db.all('SELECT * FROM show')
  return rows.map(row => new Show(row))
}

module.exports.getCheapestActivePrices = async (showId, time) => {
  // for show showId
  // for all active performances (date > now)
  // for all distinct scraping TS in frame (price created_at > now - time)
  // for all available prices
  // - get cheapest price object
  // return [{ time, performance, price }]
}

