const Rx = require('rx')
// const logging = require('./lib/logging')
const extract = require('./extract')
const inspect = require('util').inspect
const moment = require('moment')
const db = require('../db')
const Crawl = require('../models/Crawl')
const Show = require('../models/Show')

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

const persistItem = item => {

  return Show
    .loadBySlug(item.slug)
    .then(show => {
      if (!show) show = Show.createFromItem(item)
      else show.updateFromItem(item)
      return show.save()
    })
    .catch(err => Crawl.get().addError(err))
    .then(() => item)

  // for each perf
  // - persist perf
  // - persist prices
  //
}

const doCrawl = urls => {
  /*  const obs = Rx.Observer.create(
    x => console.log('onNext:', inspect(x)),
    e => console.log('onError:', e),
    () => {
    }
  )
  */
  // Set the crawl to Start

  const pipeline = Rx.Observable.from(urls)
    .flatMap(url => extract.getHtml(url, {}))
    .filter(obj => obj.html !== null)
    .flatMap(obj => extract.featuredItems(obj.html))
    .flatMap(item => extract.getHtml(item.url, {item}))
    .map(obj => extract.saleInfo(obj.html, obj.item))
    .flatMap(item => extract.getHtml(item.buyUrl, {item}))
    .map(obj => extract.prices(obj.html, obj.item))
    .flatMap(item => persistItem(item))
    .do(
      item => itemStats(item),
      err => console.log('Error', err),
      () => console.log('Pipeline completed')
    )

  // const subscription = pipeline.subscribe(obs)

  return pipeline.toPromise()
}

module.exports.crawl = () => {
  const urls = [
    'https://www.operadeparis.fr/saison-16-17/opera',
    // 'https://www.operadeparis.fr/saison-17-18/opera'
  ]

  db.open()
    .then(() => Crawl.start())
    .then(() => doCrawl(urls))
    .then(() => Crawl.stop())
    .then(() => console.log(Crawl.get().toString()))
    .catch(err => {
      Crawl.get().addError(err)
      return Crawl.stop()
    })
    .catch(err => console.log('catch err', err))
}

