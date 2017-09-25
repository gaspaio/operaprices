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

  // get more info on this erreur
  if (obj.url === null) {
    Crawl.get().addError(`Received NULL url`, {ctxt: item})
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
      Crawl.get().addError(`HTML Fetching ${obj.url}: ${err.message}`, {ctxt: obj.url})
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

    const prices = {}
    // Some performances don't have prices publicly available
    // (reserved for -40 for ex.)
    $(elem).find('div.PerformanceList__item__table > div > ol > li.PerformanceTable__rows').each((i, row) => {
      try {
        const available = $(row).attr('class').indexOf('unavailable') === -1
        const cat = $(row).children('span.PerformanceTable__label').first().text().trim()
        const price = parseInt($(row).children('span.PerformanceTable__price').first().text().trim().split(' ')[0])

        // There are errors in the web page. Some performances have
        // the prices two times, with only one available.
        // We catch the available one and store only one price per categ.
        if (!(cat in prices)) {
          prices[cat] = {available, cat, price}
        } else {
          prices[cat] = {
            available: available || prices[cat].available,
            cat,
            price
          }
        }
      } catch (err) {
        Crawl.get().addError(
          `price Extraction for ${item.buyLink}, perf ${date}. Unable to parse price: ${$(row).html()}`,
          {ctxt: obj.url}
        )
      }
    })
    item.prices[date] = Object.values(prices)
  })

  return item
}

module.exports.saleInfo = (obj) => {
  const item = obj.item
  item.buyUrl = item.saleOpen = item.saleStartDate = null

  if (!obj.html) return item

  const $ = cheerio.load(obj.html)
  const sidebar = $('body > div.content-wrapper > div.grid-container.Programmation__opera-show > div > div.Programmation__aside.grid-aside.desktop-and-up > div')

  /*
   * 3 known cases:
   * - 1) Before opening: first child is a <p> with the opening date and a buyLink (Voir les séances)
   * - 2) Open for sale and places available: the first child is a <a> with a buyLink (Réserver)
   * - 3) No more places available: first child the the div.calendar directly (and no buyLink)
   */
  const box = $(sidebar).children().first()
  let url

  // Case 1
  if (box.is('p')) {
    url = $(box).find('a').attr('href').trim()

    if (!url) {
      Crawl.get().addError(
        `URL ${obj.url} contains a <p> as first elem but no link inside. Investigate further.`,
        {ctxt: obj.url}
      )
      return item
    }

    item.buyUrl = url
    item.saleOpen = false

    try {
      const saleStart = utils.saleDate($(box).text())
      item.saleStartDate = saleStart
    } catch (err) {
      Crawl.get().addError(`Url ${url}: ${err.message}`, {ctxt: obj.url})
    }

    return item
  }

  // Case 2
  if (box.is('a')) {
    url = $(box).attr('href')

    if (!url) {
      Crawl.get().addError(
        `URL ${obj.url} contains a <a> as first elem but no link inside. Investigate further.`,
        {ctxt: obj.url}
      )
      return item
    }

    item.buyUrl = url
    item.saleOpen = true
    return item
  }

  item.saleOpen = false

  // Case 3 - no buy links
  if (box.is('div') && box.attr('class') === 'Calendar') {
    // Do nothing more
    return item
  }

  Crawl.get().addError(`Url ${url}: unexpected HTML in show page - ${box.html()}`, {ctxt: obj.url})
  return item
}
