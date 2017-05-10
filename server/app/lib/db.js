const path = require('path')
const utils = require('./utils')
const config = require('config')
const db = require('sqlite')
const moment = require('moment')
const logging = require('./logging')
const Show = require('./models/Show')
const uuid = require('uuid')
const basePath = path.join('__dirname', '..', 'db')
const Crawl = require('./modules/Crawl')

module.exports.CRAWL_DONE = 'DONE'
module.exports.CRAWL_STARTED = 'STARTED'

module.exports.open = () => {
  return Promise.resolve()
    .then(() => db.open(path.join(basePath, config.get('db.name')), {cached: true}))
  //.then(() => db.migrate({force: false, migrationsPath: path.join(basePath, 'migrations')}))
}

module.exports.db = db

module.exports.getShows = async (options) => {
  let q = 'SELECT * FROM show'

  if ('active' in options && options.active) {
    q += ` WHERE end_date > ${utils.nowDate()}  `
  }

  const rows = await db.all(q)
  return rows.map(row => new Show(row))
}

// Prices
module.exports.insertPrice = async price => {
  const q = `INSERT INTO price VALUES (${price.crawlId}, ${price.performanceId}, ${price.categoryId}, ${price.price}, ${this.available ? 1 : 0})`
  return await db.run(q).then(stmt => {
    price.id = stmt.lastID
    return price
  })
}

// Performances
module.exports.upsertPerformance = async performance => {
  if (!performance.date || !performance.showId) throw Error(`Cannot insert performance without date and/or showId (sid=${performance.showId}, date=${performance.date})`)
    return db
      .get(`SELECT * FROM performance WHERE showId=${performance.showId} AND date=${performance.date}`)
      .then(row => {
        if (row) return performance.update(row)

        performance.createdAt = Crawl.get().startTime
        return db
          .run(`INSERT INTO performance (showId, date, createdAt) VALUES (${performance.showId}, ${performance.date}, ${performance.createdAt})`)
          .then(stmt => {
            performance.id = stmt.lastID
            return performance
          })
      })
}

// Shows

module.exports.getLastCrawl = async () => {
  let q = 'SELECT * FROM crawl ORDER BY time DESC LIMIT 1'
  return await db.get(q)
}

module.exports.getLowestPerformancePrices = async (showId, options) => {
  // For each active performance of show, get the series of cheapest prices
  options = Object.assign({
    time: utils.nowDate() - config.get('db.default_time_window') * 60 * 60
  }, options)

  let q = `SELECT
  c.time crawlTime,
  p.date performanceDate,
  pr.category priceCategory, MIN(pr.price) as minPrice
FROM price pr
INNER JOIN crawl c on c.id = pr.crawl_id
INNER JOIN performance p on p.id = pr.performance_id
INNER JOIN show s on p.show_id = s.id
WHERE
  c.time > ${options.time}
  AND p.date > ${utils.now()}
  AND pr.available = 1
  AND s.id = ${showId}
GROUP BY p.date, c.time
ORDER BY p.date ASC, c.time ASC`

  const priceSeries = await db.all(q)

  const performances = new Map()
  priceSeries.forEach(line => {
    const curr = performances.has(line.performanceDate) ? performances.get(line.performanceDate) : []
    curr.push([line.crawlTime, line.minPrice, line.priceCategory])
    performances.set(line.performanceDate, curr)
  })

  return performances
}

