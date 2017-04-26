const path = require('path')
const utils = require('./utils')
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

module.exports.getShows = async (options) => {
  let q = 'SELECT * FROM show'

  if ('active' in options && options.active) {
    q += ` WHERE end_date > ${utils.nowDate()}  `
  }

  const rows = await db.all(q)
  return rows.map(row => new Show(row))
}

module.exports.getCheapestActivePrices = async (showId, options) => {
  // For each active performance of show, get the series of cheapest prices
  const timeWindow = options.time || utils.nowDate() - config.get('db.default_time_window') * 60 * 60

  let q = ```
SELECT
  c.id, c.time,
  p.id, p.date,
  pr.category, MIN(pr.price) as price, pr.available
FROM price
INNER JOIN crawl c on c.id = pr.crawl_id
INNER JOIN performance p on p.id = pr.performance_id
INNER JOIN show s on p.show_id = s.id
WHERE
  c.time > ${timeWindow}
  AND p.date > ${utils.now()}
  AND pr.available = 1
  AND s.id = ${showId}
GROUP BY p.date, c.time
ORDER BY p.date ASC, c.time ASC;
```

  // return [{ time, performance, price }]
}

