const Rx = require('rx')
// const logging = require('./lib/logging')
const extract = require('./extract')
const reg = require('./registry')
const inspect = require('util').inspect
const moment = require('moment')

const operaUrls = [
  'https://www.operadeparis.fr/saison-16-17/opera',
  'https://www.operadeparis.fr/saison-17-18/opera'
]

module.exports.crawl = urls => {
  const obs = Rx.Observer.create(
    x => console.log('onNext:', inspect(x)),
    e => console.log('onError:', e),
    () => {
      reg.addStat('end', moment.utc().unix())
      console.log(
        'Completed: %d requests in %s seconds, %s errors',
        reg.getStats().requests,
        moment.duration(reg.getStats().end - reg.getStats().start, 'seconds').seconds(),
        reg.getErrors().length
      )

      reg.getErrors().forEach(err => console.error(err))
    }
  )

  const pipeline = Rx.Observable.from(urls)
    .flatMap(url => extract.getHtml(url, {}))
    .filter(obj => obj.html !== null)
    .flatMap(obj => extract.featuredItems(obj.html))
    .flatMap(item => extract.getHtml(item.url, {item}))
    .map(obj => extract.saleInfo(obj.html, obj.item))
    .flatMap(item => extract.getHtml(item.buyLink, {item}))
    .map(obj => extract.prices(obj.html, obj.item))

  const subscription = pipeline.subscribe(obs)

  return pipeline
}

