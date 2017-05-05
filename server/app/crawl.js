const fetch = require('node-fetch')
const Rx = require('rx')
const cheerio = require('cheerio')
const logging = require('./lib/logging')
const parsing = require('./lib/utils.parsing')
const inspect = require('util').inspect
const moment = require('moment')

const urls = [
  'https://www.operadeparis.fr/saison-16-17/opera',
  //'https://www.operadeparis.fr/saison-17-18/opera'
]

const PIPELINE_ERRORS = []

const STATS = {
  requests: 0,
  start: moment.utc().unix(),
  end: 0
}

// Async fetch
const getHtml = (url, wrapper) => {
  if (!url) {
    wrapper.html = null
    return Promise.resolve(wrapper)
  }

  STATS.requests += 1
  return fetch(url)
    .then(res => res.text())
    .then(html => {
      wrapper.html = html
      return wrapper
    })
    .catch(err => {
      err.message = `HTML Fetching ${url}: ${err.message}`
      PIPELINE_ERRORS.push(err)
      wrapper.html = null
      return wrapper
    })
}


const extractItems = (html, context) => {
  const $ = cheerio.load(html)
  const featured = $('body > div.content-wrapper > div.grid-row-prefooter > ul.FeaturedList > li > div.FeaturedList__card > div.FeaturedList__card-content')
  const items = []
  featured.each((i, item) => {
    try {
      items.push(parsing.featuredItem($(item)))
    } catch (err) {
      err.message = `Item extraction: ${err.message}`
      PIPELINE_ERRORS.push(err)
    }
  })

  if (!items.length) {
    return Rx.Observable.empty()
  }

  return items
}

const extractPrices = (html, item) => {
  item.prices = {}
  if (!html) return item

  $ = cheerio.load(html)
  $('body > div.content-wrapper > section.grid-container > ul.PerformanceList > li').each((i, elem) => {
    const day = $(elem).find('div.PerformanceList__item__metadata > div.PerformanceDate').attr('title')
    const hour = $(elem).find('div.PerformanceList__item__metadata > div.PerformanceDate__extra > p.PerformanceDate__hours').text()

    const date = parsing.performanceDate(day, hour)
  })

  return item
}

const extractSaleInfo = (html, item) => {
  item.buyLink = item.saleOpen = item.saleStartTime = null

  if (!html) return item

  const $ = cheerio.load(html)
  const linkBox = $('body > div.content-wrapper > div.grid-container.Programmation__opera-show > div > div.Programmation__aside.grid-aside.desktop-and-up > div')

  let buyLink = $(linkBox).children().first().attr('href')
  if (buyLink) {
    item.buyLink = buyLink
    item.saleOpen = true
    return item
  }

  const buyBox = $(linkBox).children().first()
  if (!buyBox) {
    PIPELINE_ERRORS(new Error(`URL ${item.url} doesnt contain a buy box nor a buy link. Investigate further.`))
    return item
  }

  const url = $(buyBox).find('a').attr('href').trim()
  if (!url) {
    PIPELINE_ERRORS(new Error(`URL ${item.url} contains a buy box but no link inside. Investigate further.`))
    return item
  }

  item.buyLink = url
  item.saleOpen = false

  try {
    item.saleStartTime = parsing.parseSaleDate($(buyBox).text())
  } catch (err) {
    err.message = `Url ${url}: ${err.message}`
    PIPELINE_ERRORS(err)
  }

  return item
}
// Observable(Urls) => async fetch HTML => parse HTML and yield shows => async fetch show page => parse ticket links => async fetch performances page => page perfs page => save everything



const obs = Rx.Observer.create(
  x => console.log('onNext:', inspect(x)),
  e => console.log('onError:', e),
  () => {
    STATS.end = moment.utc().unix()
    console.log(
      'Completed: %d requests in %s seconds, %s errors',
      STATS.requests,
      moment.duration(STATS.end - STATS.start, 'seconds').seconds(),
      PIPELINE_ERRORS.length)
    PIPELINE_ERRORS.forEach(err => console.error(err))
  }
)


// implement operator to catch & log errors: https://xgrommx.github.io/rx-book/content/getting_started_with_rxjs/implementing_your_own_operators.html


// Handle bad URLs


const pipeline = Rx.Observable.from(urls)
  .flatMap(url => getHtml(url, {}))
  .filter(obj => obj.html !== null)
  .flatMap(obj => extractItems(obj.html))
  .flatMap(item => getHtml(item.url, {item}))
  .map(obj => extractSaleInfo(obj.html, obj.item))
  .flatMap(item => getHtml(item.buyLink, {item}))
  .map(obj => extractPrices(obj.html, obj.item))

//  filter(item => )
// call extract on each html and yield array of items
// flatMap -> each item -> call link ->
// flatMap -> each link, + props in object
// flatMap -> available performance pages
const subscription = pipeline.subscribe(obs)

