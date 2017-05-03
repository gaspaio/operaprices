const fetch = require('node-fetch')
const Rx = require('rx')
const cheerio = require('cheerio')
const logging = require('./lib/logging')
const parsing = require('./lib/utils.parsing')
const inspect = require('util').inspect

const urls = [
  'https://www.operadeparis.fr/saison-16-17/opera',
  'https://www.operadeparis.fr/saison-17-18/opera'
]

const PIPELINE_ERRORS = []

// Async fetch
const getHtml = url => {
  const doFetch = fetch(url)
    .then(res =>res.text())
    .catch(err => {
      PIPELINE_ERRORS.push(new Error(`Error when talking to URL: ${url}`))
      return null
    })

  return Rx.Observable.fromPromise(doFetch).filter(x => x != null)
}


const extractItems = (html, context) => {
  console.log('received %s chars', html.length)
  const $ = cheerio.load(html)
  const featured = $('body > div.content-wrapper > div.grid-row-prefooter > ul.FeaturedList > li > div.FeaturedList__card > div.FeaturedList__card-content')
  const items = []
  featured.each((i, item) => {
    const props = {}
    try {
      props.title = $(item).find('div.FeaturedList__card-title > a.title-oeuvre > span').text().trim()
      if (!props.title) throw new Error(`No title found for item ${i}`)

      props.url = $(item).find('div.FeaturedList__card-title > a.title-oeuvre').attr('href')
      if (!props.url) throw new Error(`No showLink found for item ${i}`)

      props.author = $(item).find('div.FeaturedList__card-title > p > span').text().trim()
      if (!props.author) throw new Error(`No author found for item ${i}`)

      props.type = parseType($(item).find('div.FeaturedList__card-title > p').text().replace(props.author, ''))
      if (!props.type) throw new Error(`Unknown type for item ${i}`)

      const locationStr = $(item).find('div.FeaturedList__card-metadata > div.FeaturedList__metadata-location').text().trim()

      const [startDate, endDate, location] = parsing.locationString(locationStr)
      Object.assign(props, {startDate, endDate, location})
      if (props.startDate > props.endDate || !props.location) throw new Error(`Unable to parse location for item ${i}`)
      //props.buyLink = $(item).find('a.FeaturedList__reserve-btn').attr('href') || ''
      // if buyLink, extract 'id' and 'slug'
      //props.slug = ''
      items.push(props)
    } catch (err) {
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
    console.log('onCompleted, %s errors', PIPELINE_ERRORS.length)
  }
)


// implement operator to catch & log errors: https://xgrommx.github.io/rx-book/content/getting_started_with_rxjs/implementing_your_own_operators.html


// Handle bad URLs
const pipeline = Rx.Observable.from(urls)
  .flatMap(url => getHtml(url))
  .flatMap(html => extractItems(html))

// call extract on each html and yield array of items
// flatMap -> each item -> call link ->
// flatMap -> each link, + props in object
// flatMap -> available performance pages
const subscription = pipeline.subscribe(obs)

