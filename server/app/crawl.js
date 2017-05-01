const fetch = require('node-fetch')
const Rx = require('rx')
const cheerio = require('cheerio')
const logging = require('./lib/logging')
const utils = require('./lib/utils.parsing')
const inspect = require('util').inspect

const urls = [
  'httpsx://www.operadeparis.fr/saison-16-17/opera',
  // 'https://www.operadeparis.fr/saison-17-18/opera'
]

const errorItem = (err, context = {}) => {return {type: 'error', err, context}}
const htmlItem = (html, url = '') => {return {type: 'html', html, url}}

// Async fetch
const getHtml = async url => {
  let res
  try {
    res = await fetch(url)
  } catch (err) {
    console.log("here", err)
    return errorItem(new Error(`Error when talking to URL: ${url}`))
  }
  if (res.status >= 300) {
    return errorItem(new Error(`Invalid status code received from URL: ${url}`))
  }
  const text = await res.text()
  return htmlItem(text, url)
}


const parseType = str => {
  const type = str.replace(/\s+/g, '')
  let ret = ''
  switch (type) {
    case 'Opéra':
      ret = 'opera'
      break
    case 'Opéra-Académie':
      ret = 'opera_academie'
      break
    default:
      ret = ''
      break
  }
  return ret
}

const parseBuyLink = str => {
  const matches = /^https?:\/\/www\.operadeparis\.fr\/billetterie\/([0-9]+-[^\/]+)$/.exec(props.buyLink)
  if (!matches || matches.length != 2) throw new Error(`Unable to parse buyLink for item ${i}`)
  return matches[1]
}

const extractItems = (html, context) => {
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

      const [startDate, endDate, location] = utils.parseLocationString(locationStr)
      Object.assign(props, {startDate, endDate, location})
      if (props.startDate > props.endDate || !props.location) throw new Error(`Unable to parse location for item ${i}`)
      //props.buyLink = $(item).find('a.FeaturedList__reserve-btn').attr('href') || ''
      // if buyLink, extract 'id' and 'slug'
      //props.slug = ''
      items.push(props)
    } catch (err) {
      // console.log('pushing error', err)
      items.push({type: 'error', err, context})
    }
  })
  return items
}

// Observable(Urls) => async fetch HTML => parse HTML and yield shows => async fetch show page => parse ticket links => async fetch performances page => page perfs page => save everything

const errors = []

const handleErrors = () => Rx.Observer.create(
  data => {
    if (data.type != 'error') return
    // TO LOGGING
    console.log('Received error: %s | %s | %s', data.context.id, data.context.url, data.err.message)
    errors.push(data)
  }
)



const obs = Rx.Observer.create(
  x => console.log('onNext:', inspect(x)),
  e => console.log('onError -: %s', e),
  () => console.log('onCompleted')
)


// Handle bad URLs

const source = Rx.Observable.from(urls)
  .flatMap(url => getHtml(url))
  .flatMap(data => extractItems(data.html, {id: 'item-extraction', url: data.url}))
  .do(handleErrors())
  .filter(x => x.type != 'error')

// call extract on each html and yield array of items
// flatMap -> each item -> call link ->
// flatMap -> each link, + props in object
// flatMap -> available performance pages
const subscription = source.subscribe(obs)

