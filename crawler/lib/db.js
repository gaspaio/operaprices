const path = require('path')
const utils = require('./utils')
const config = require('config')
const db = require('sqlite')
const Show = require('./models/Show')
const Crawl = require('./models/Crawl')

module.exports.CRAWL_DONE = 'DONE'
module.exports.CRAWL_STARTED = 'STARTED'

module.exports.open = () => {
  const dbPath = path.join(utils.dirs('data'), `${process.env.NODE_ENV}.db`)
  return Promise.resolve()
    .then(() => db.open(dbPath, {cached: true}))
//    .then(() => db.migrate({
//      force: false,
//      migrationsPath: path.join('__dirname', '..', 'db', 'migrations')
//    }))
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

module.exports.getLastCrawl = async () => {
  const row = await db.get('SELECT * FROM crawl ORDER BY startTime DESC LIMIT 1')
  return new Crawl.Crawl(row)
}

// Prices
module.exports.insertPrice = async price => {
  const stmt = await db.run(`INSERT INTO price VALUES (${price.crawlId}, ${price.performanceId}, '${price.category}', ${price.price}, ${price.available ? 1 : 0})`)
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
// options: active, saleOpen
module.exports.getShows = async options => {
  let q = 'SELECT * FROM show'
  const opts = Object.assign({active: null, saleOpen: null}, options)

  const wheres = []
  if (opts.active !== null) {
    wheres.push(`endDate ${opts.active ? '>' : '<'} ${utils.nowDate()}`)
  }

  if (opts.saleOpen !== null) {
    wheres.push(`saleOpen = ${opts.saleOpen ? 1 : 0}`)
  }

  if (wheres.length) {
    q += ` WHERE ${wheres.join(' AND ')}`
  }

  const rows = await db.all(q)
  return rows.map(row => new Show(row))
}

module.exports.getShow = async id => {
  let q = `SELECT * FROM show WHERE id = ${parseInt(id)}`
  const row = await db.get(q)
  if (!row) return null
  return new Show(row)
}

module.exports.upsertShow = async item => {
  const row = await db.get(`SELECT * FROM show WHERE slug='${item.slug}'`)

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

module.exports.getLowestPerformancePrices = async (showId, options) => {
  // For each active performance of show, get the series of cheapest prices
  options = Object.assign({
    time: utils.now() - config.get('shows_time_window') * 60 * 60
  }, options)

  let q = `SELECT
  c.startTime crawlTime,
  p.date performanceDate,
  pr.category priceCategory,
  MIN(pr.price) as minPrice
FROM price pr
INNER JOIN crawl c on c.id = pr.crawlId
INNER JOIN performance p on p.id = pr.performanceId
INNER JOIN show s on p.showId = s.id
WHERE
  c.startTime > ${options.time}
  AND p.date >= ${utils.nowDate()}
  AND pr.available = 1
  AND s.id = ${showId}
GROUP BY p.date, c.startTime
ORDER BY p.date ASC, c.startTime ASC`

  const priceSeries = await db.all(q)

  const priceMap = new Map()
  priceSeries.forEach(line => {
    const curr = priceMap.has(line.performanceDate) ? priceMap.get(line.performanceDate) : []
    curr.push([line.crawlTime, line.minPrice, line.priceCategory])
    priceMap.set(line.performanceDate, curr)
  })
  return priceMap
}
