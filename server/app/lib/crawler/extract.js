const fetch = require('node-fetch')
const cheerio = require('cheerio')
const Rx = require('rx')
const Crawl = require('../models/Crawl')
const utils = require('./utils')

const getHtml = module.exports.getHtml = (url, wrapper) => {
  if (!url) {
    wrapper.html = null
    return Promise.resolve(wrapper)
  }

  Crawl.get().incStat('requests')
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      wrapper.html = html
      return wrapper
    })
    .catch(err => {
      err.message = `HTML Fetching ${url}: ${err.message}`
      Crawl.get().addError(err)
      wrapper.html = null
      return wrapper
    })
}

const featuredItems = module.exports.featuredItems = (html, context) => {
  const $ = cheerio.load(html)
  const featured = $('body > div.content-wrapper > div.grid-row-prefooter > ul.FeaturedList > li > div.FeaturedList__card > div.FeaturedList__card-content')
  const items = []
  featured.each((i, item) => {
    try {
      items.push(utils.featuredItem($(item)))
    } catch (err) {
      err.message = `Item extraction: ${err.message}`
      Crawl.get().addError(err)
    }
  })

  if (!items.length) {
    return Rx.Observable.empty()
  }

  return items
}

const prices = module.exports.prices = (html, item) => {
  item.prices = {}
  if (!html) return item

  $ = cheerio.load(html)
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
      err.message = `Price extract for ${item.buyLink} failed. ${err.message}`
      Crawl.get().addError(err)
      return item
    }

    item.prices[date] = []
    $(elem).find('div.PerformanceList__item__table > div > ol > li.PerformanceTable__rows').each((i, row) => {
      try {
        const available = $(row).attr('class').split(' ').indexOf('unavailable') === -1
        const cat = $(row).children('span.PerformanceTable__label').first().text().trim()
        const price = parseInt($(row).children('span.PerformanceTable__price').first().text().trim().split(' ')[0])
        item.prices[date].push({available, cat, price})
      } catch (err) {
        err.message = `price Extraction for ${item.buyLink}, perf ${date}. Unable to parse price: ${$(row).html()}`
        Crawl.get().addError(err)
      }
    })
  })

  return item
}

const saleInfo = module.exports.saleInfo = (html, item) => {
  item.buyUrl = item.saleOpen = item.saleStartDate = null

  if (!html) return item

  const $ = cheerio.load(html)
  const linkBox = $('body > div.content-wrapper > div.grid-container.Programmation__opera-show > div > div.Programmation__aside.grid-aside.desktop-and-up > div')

  let buyUrl = $(linkBox).children().first().attr('href')
  if (buyUrl) {
    item.buyUrl = buyUrl
    item.saleOpen = true
    return item
  }

  const buyBox = $(linkBox).children().first()
  if (!buyBox) {
    Crawl.get().addError(Error(`URL ${item.url} doesnt contain a buy box nor a buy link. Investigate further.`))
    return item
  }

  const url = $(buyBox).find('a').attr('href').trim()
  if (!url) {
    Crawl.get().addError(Error(`URL ${item.url} contains a buy box but no link inside. Investigate further.`))
    return item
  }

  item.buyUrl = url
  item.saleOpen = false

  try {
    item.saleStartDate = utils.saleDate($(buyBox).text())
  } catch (err) {
    err.message = `Url ${url}: ${err.message}`
    Crawl.get().addError(err)
  }

  return item
}

