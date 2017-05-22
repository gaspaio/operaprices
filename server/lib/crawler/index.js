const Rx = require('rx')
const logger = require('../logging').logger
const extract = require('./extract')
const persist = require('./persist')
const Crawl = require('../models/Crawl')
const db = require('../db')

const itemStats = item => {
  const c = Crawl.get()

  c.incStat('total_items')

  c.incStat('total_performances', Object.keys(item.prices).length)

  if (item.saleOpen) c.incStat('on_sale')
  const sl = c.getStat('locations', {})
  sl[item.location] = item.location in sl ? sl[item.location] + 1 : 1
  c.setStat('locations', sl)

  const st = c.getStat('types', {})
  st[item.type] = item.type in st ? st[item.type] + 1 : 1
  c.setStat('types', st)

  return item
}

const doCrawl = urls => {
  const pipeline = Rx.Observable.from(urls.map(url => { return {url} }))
    .flatMap(obj => extract.getHtml(obj))
    .filter(obj => obj.html !== null)
    .flatMap(obj => extract.featuredItems(obj))
    .flatMap(item => extract.getHtml({url: item.url, item}))
    .filter(obj => obj.html !== null )
    .map(obj => extract.saleInfo(obj)) // .url, .item, .html
    .flatMap(item => extract.getHtml({url: item.buyUrl, item}))
    .filter(obj => obj.html !== null)
    .map(obj => extract.prices(obj))
    .do(item => itemStats(item))

    // Persist everything
    .flatMap(item => persist.show(item))
    .flatMap(obj => Object.keys(obj.item.prices).map(date => {
      return {show: obj.show, date, prices: obj.item.prices[date]}
    }))
    .flatMap(obj => persist.performance(obj.show, obj.date, obj.prices))
    .flatMap(obj => persist.prices(obj.performance, obj.prices))

  return pipeline.toPromise()
}

module.exports.crawl = () => {
  const urls = [
    'https://www.operadeparis.fr/saison-16-17/opera',
    'https://www.operadeparis.fr/saison-17-18/opera',
    'https://www.operadeparis.fr/saison-16-17/ballet',
    'https://www.operadeparis.fr/saison-17-18/ballet'
  ]

  return db.open()
    .then(() => Crawl.start())
    .then(() => doCrawl(urls))
    .then(() => Crawl.stop())
    .catch(err => {
      if (Crawl.get()) {
        Crawl.get().addError(err)
        Crawl.stop()
      } else {
        logger.error(err)
      }
    })
    .then(() => db.close())
}
