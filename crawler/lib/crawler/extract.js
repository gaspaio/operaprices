const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Rx = require('rx')
const Crawl = require('../models/Crawl')
const utils = require('./utils')

module.exports.getHtml = (obj) => {
  if (!obj || !('url' in obj)) {
    obj.html = null
    return Promise.resolve(obj)
  }

  Crawl.get().incStat('requests')
  return fetch(obj.url)
    .then(res => res.text())
    .then(html => {
      obj.html = html
      return obj
    })
    .catch(err => {
      err.message = `HTML Fetching ${url}: ${err.message}`
      err.ctxt = obj.url
      Crawl.get().addError(err)
      obj.html = null
      return obj
    })
}

module.exports.featuredItems = (obj) => {
  const $ = cheerio.load(obj.html)
  const featured = $('body > div.content-wrapper > div.grid-row-prefooter > ul.FeaturedList > li > div.FeaturedList__card > div.FeaturedList__card-content')
  const items = []
  featured.each((i, box) => {
    try {
      const item = utils.featuredItem($(box))
      if (['opera', 'ballet'].includes(item.type)) items.push(item)
    } catch (err) {
      Crawl.get().addError(`Item extraction: ${err.message}`, {ctxt: `${obj.url}#${i}`})
    }
  })

  if (!items.length) {
    return Rx.Observable.empty()
  }

  return items
}

module.exports.prices = (obj) => {
  const item = obj.item
  item.prices = {}

  if (!obj.html) return item

  const $ = cheerio.load(obj.html)
  $('body > div.content-wrapper > section.grid-container > ul.PerformanceList > li').each((i, elem) => {
    // The past representations are still in the HTML but have display: None and empty tables
    if ($(elem).find('div.PerformanceList__item__table').text().indexOf('Représentation passée') !== -1) {
      return
    }

    const day = $(elem).find('div.PerformanceList__item__metadata > div.PerformanceDate').attr('title')
    const hour = $(elem).find('div.PerformanceList__item__metadata > div.PerformanceDate__extra > p.PerformanceDate__hours').text()
    let date
    try {
      date = utils.performanceDate(day, hour)
    } catch (err) {
      Crawl.get().addError(`Price extract for ${item.buyLink} failed. ${err.message}`, {ctxt: obj.url})
      return item
    }

    item.prices[date] = []
    $(elem).find('div.PerformanceList__item__table > div > ol > li.PerformanceTable__rows').each((i, row) => {
      try {
        const available = $(row).attr('class').indexOf('unavailable') === -1
        const cat = $(row).children('span.PerformanceTable__label').first().text().trim()
        const price = parseInt($(row).children('span.PerformanceTable__price').first().text().trim().split(' ')[0])
        item.prices[date].push({available, cat, price})
      } catch (err) {
        err.message = `price Extraction for ${item.buyLink}, perf ${date}. Unable to parse price: ${$(row).html()}`
        Crawl.get().addError(
          `price Extraction for ${item.buyLink}, perf ${date}. Unable to parse price: ${$(row).html()}`,
          {ctxt: obj.url}
        )
      }
    })
  })

  return item
}

module.exports.saleInfo = (obj) => {
  const item = obj.item
  item.buyUrl = item.saleOpen = item.saleStartDate = null

  if (!obj.html) return item

  const $ = cheerio.load(obj.html)
  const linkBox = $('body > div.content-wrapper > div.grid-container.Programmation__opera-show > div > div.Programmation__aside.grid-aside.desktop-and-up > div')

  let buyUrl = $(linkBox).children().first().attr('href')
  if (buyUrl) {
    item.buyUrl = buyUrl
    item.saleOpen = true
    return item
  }

  const buyBox = $(linkBox).children().first()
  let err
  if (!buyBox) {
    Crawl.get().addError(
      `URL ${obj.url} doesnt contain a buy box nor a buy link. Investigate further.`,
      {ctxt: obj.url}
    )
    return item
  }

  const url = $(buyBox).find('a').attr('href').trim()
  if (!url) {
    err = Error(`URL ${obj.url} contains a buy box but no link inside. Investigate further.`)
    err.ctxt = obj.url
    Crawl.get().addError(
      `URL ${obj.url} contains a buy box but no link inside. Investigate further.`,
      {ctxt: obj.url}
    )
    return item
  }

  item.buyUrl = url
  item.saleOpen = false

  try {
    item.saleStartDate = utils.saleDate($(buyBox).text())
  } catch (err) {
    Crawl.get().addError(`Url ${url}: ${err.message}`, {ctxt: obj.url})
  }

  return item
}
