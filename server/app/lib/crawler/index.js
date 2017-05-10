const Rx = require('rx')
// const logging = require('./lib/logging')
const extract = require('./extract')
const inspect = require('util').inspect
const moment = require('moment')
const db = require('../db')
const Crawl = require('../models/Crawl')
const Show = require('../models/Show')
const Performance = require('../models/Performance')
const Price = require('../models/Price')

const itemStats = item => {
  const c = Crawl.get()

  c.incStat('total_items')

  c.incStat('total_performances', Object.keys(item).length)
  if (item.saleOpen) c.incStat('on_sale')

  const sl = c.getStat('locations', {})
  sl[item.location] = item.location in sl ? sl[item.location] + 1 : 1
  c.setStat('locations', sl)

  const st = c.getStat('types', {})
  st[item.type] = item.type in st ? st[item.type] + 1 : 1
  c.setStat('types', st)

  return item
}

const persistShow = item => {
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

const persistPerformance = (show, date, prices) => {
  const p = db
    .upsertPerformance(new Performance({showId: show.id, date}))
    .then(performance => {
      return {performance, prices}
    })
    .catch(err => {
      Crawl.get().addError(err)
      return null
    })

  return Rx.Observable.fromPromise(p).filter(obj => obj !== null)
}

const persistPrices = (performance, prices) => Promise.all(
  prices.map(p => db
    .insertPrice(new Price({
      crawlId: Crawl.get().id,
      performanceId: performance.id,
      category: p.cat,
      price: p.price,
      available: p.available
    }))
  )
)


const doCrawl = urls => {
  const pipeline = Rx.Observable.from(urls)
    .flatMap(url => extract.getHtml(url, {}))
    .filter(obj => obj.html !== null)
    .flatMap(obj => extract.featuredItems(obj.html))
    .flatMap(item => extract.getHtml(item.url, {item}))
    .map(obj => extract.saleInfo(obj.html, obj.item))
    .flatMap(item => extract.getHtml(item.buyUrl, {item}))
    .map(obj => extract.prices(obj.html, obj.item))
    .do(item => itemStats(item))

    // Persist everything
    .flatMap(item => persistShow(item))
    .flatMap(obj => Object.keys(obj.item.prices).map(date => {
      return {show: obj.show, date, prices: obj.item.prices[date]}
    }))
    .flatMap(obj => persistPerformance(obj.show, obj.date, obj.prices))
    .flatMap(obj => persistPrices(obj.performance, obj.prices))

  // const subscription = pipeline.subscribe(obs)

  return pipeline.toPromise()
}

module.exports.crawl = () => {
  const urls = [
    'https://www.operadeparis.fr/saison-16-17/opera',
    'https://www.operadeparis.fr/saison-17-18/opera'
  ]

  db.open()
    .then(() => Crawl.start())
    .then(() => doCrawl(urls))
    .then(() => Crawl.stop())
    .then(() => console.log(Crawl.get().toString()))
    .catch(err => {
      console.log(err)
      Crawl.get().addError(err)
      return Crawl.stop()
    })
}

