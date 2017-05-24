const Rx = require('rx')
const Crawl = require('../models/Crawl')
const Performance = require('../models/Performance')
const Price = require('../models/Price')
const db = require('../db')

const show = item => {
  const p = db
    .upsertShow(item)
    .then(show => {
      return {item, show}
    })
    .catch(err => {
      Crawl.get().addError(err)
      return null
    })

  return Rx.Observable.fromPromise(p).filter(obj => obj !== null)
}

const performance = (show, date, prices) => {
  const p = db
    .upsertPerformance(new Performance({showId: show.id, date}))
    .then(perf => {
      return {performance: perf, prices}
    })
    .catch(err => {
      Crawl.get().addError(err)
      return null
    })

  return Rx.Observable.fromPromise(p).filter(obj => obj !== null)
}

const prices = (performance, prs) => Promise.all(
  prs.map(p => db
    .insertPrice(new Price({
      crawlId: Crawl.get().id,
      performanceId: performance.id,
      category: p.cat,
      price: p.price,
      available: p.available
    }))
  )
)

module.exports = {show, performance, prices}
