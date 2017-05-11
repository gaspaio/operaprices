const path = require('path')
const utils = require('./utils')
const config = require('config')
const db = require('sqlite')
const moment = require('moment')
const logging = require('./logging')
const Show = require('./models/Show')
const uuid = require('uuid')
const Crawl = require('./models/Crawl')

module.exports.CRAWL_DONE = 'DONE'
module.exports.CRAWL_STARTED = 'STARTED'

module.exports.open = () => {
  const dbfile = path.join('__dirname', '..', config.get('db.location'), config.get('db.name'))
  return Promise.resolve()
    .then(() => db.open(dbfile, {cached: true}))
  //.then(() => db.migrate({force: false, migrationsPath: path.join(basePath, 'migrations')}))
}

module.exports.close = () => {
  return db.close()
}

// Crawl
module.exports.crawlStart = async crawl => {
  const stmt = await db.run(`INSERT INTO crawl (startTime, status) VALUES (${crawl.startTime}, '${crawl.status}')`)
  crawl.id = stmt.lastID
  return crawl
}

module.exports.crawlStop = async crawl => {
  const errors = JSON.stringify(crawl.errors).replace(/'/g, '')
  const stats = JSON.stringify(crawl.stats)
  await db.run(`UPDATE OR FAIL crawl SET (endTime, status, stats, errors)=(${crawl.endTime}, '${crawl.status}', '${stats}', '${errors}') WHERE id=${crawl.id}`)
  return crawl
}

// Prices
module.exports.insertPrice = async price => {
  const stmt = await db.run(`INSERT INTO price VALUES (${price.crawlId}, ${price.performanceId}, '${price.category}', ${price.price}, ${this.available ? 1 : 0})`)
  price.id = stmt.lastID
  return price
}

// Performances
module.exports.upsertPerformance = async performance => {
  if (!performance.date || !performance.showId) throw Error(`Cannot insert performance without date and/or showId (sid=${performance.showId}, date=${performance.date})`)

  const row = await db.get(`SELECT * FROM performance WHERE showId=${performance.showId} AND date=${performance.date}`)
  if (row) return performance.update(row)

  performance.createdAt = Crawl.get().startTime
  const stmt = await db.run(`INSERT INTO performance (showId, date, createdAt) VALUES (${performance.showId}, ${performance.date}, ${performance.createdAt})`)
  performance.id = stmt.lastID
  return performance
}

// Shows
module.exports.getShows = async (options) => {
  let q = 'SELECT * FROM show'

  if ('active' in options && options.active) {
    q += ` WHERE end_date > ${utils.nowDate()}  `
  }

  const rows = await db.all(q)
  return rows.map(row => new Show(row))
}

module.exports.upsertShow = async item => {
  row = await db.get(`SELECT * FROM show WHERE slug='${item.slug}'`)

  let show
  if (!row) show = new Show(item)
  else show = (new Show(row)).update(item)

  show.updatedAt = Crawl.get().startTime
  if (!show.createdAt) show.createdAt = show.updatedAt

  const values = [
    `'${show.slug}'`,
    `'${show.type}'`,
    `'${utils.sqlClean(show.title)}'`,
    `'${utils.sqlClean(show.author)}'`,
    `'${utils.sqlClean(show.location)}'`,
    `'${utils.sqlClean(show.url)}'`,
    `'${utils.sqlClean(show.buyUrl)}'`,
    `${show.saleStartDate}`,
    `${show.saleOpen === null ? null : (show.saleOpen ? 1 : 0)}`,
    `${show.startDate}`,
    `${show.endDate}`,
    `${show.createdAt}`,
    `${show.updatedAt}`
  ].join(',')

  let q
  if (!show.id) {
    q = `INSERT OR FAIL INTO show (${Show.getFields()}) VALUES (${values})`
  } else {
    q = `UPDATE OR FAIL show SET (${Show.getFields()})=(${values}) WHERE id = ${show.id}`
  }

  const stmt = await db.run(q)
  if (!show.id) show.id = stmt.lastID
  return show
}

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

