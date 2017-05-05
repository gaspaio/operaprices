const fetch = require('node-fetch')
const Rx = require('rx')
const cheerio = require('cheerio')
const logging = require('./lib/logging')
const parsing = require('./lib/utils.parsing')
const inspect = require('util').inspect
const moment = require('moment')

const urls = [
  'https://www.operadeparis.fr/saison-16-17/opera',
  'https://www.operadeparis.fr/saison-17-18/opera'
]

const PIPELINE_ERRORS = []

const STATS = {
  requests: 0,
  start: moment.utc().unix(),
  end: 0
}

// Async fetch
const getHtml = (url, wrapper) => {
  STATS.requests += 1
  const doFetch = fetch(url)
    .then(res => res.text())
    .then(html => {
      wrapper.html = html
      return wrapper
    })
    .catch(err => {
      err.message = `HTML Fetching ${url}: ${err.message}`
      PIPELINE_ERRORS.push(err)
      return null
    })

  return Rx.Observable.fromPromise(doFetch).filter(x => x != null)
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
  .flatMap(obj => extractItems(obj.html))
  .flatMap(item => getHtml(item.url, {item}))
  .map(obj => parsing.extractSaleInfo(obj.html, obj.item))
//.map(item => saveItem(item))
//  filter(item => )
// call extract on each html and yield array of items
// flatMap -> each item -> call link ->
// flatMap -> each link, + props in object
// flatMap -> available performance pages
const subscription = pipeline.subscribe(obs)

