const fetch = require('node-fetch')
const cheerio = require('cheerio')
const logging = require('./lib/logging')

const url = 'https://www.operadeparis.fr/saison-17-18/opera'

// Async fetch
const getHtml = async url => await fetch(url).then(res => res.text())

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

const parseLocation = str => {
  const location = str.replace(/\s+/g, '')
  let start, end, loc

  return [start, end, loc]
}

const extractItems = (html, context) => {
  const $ = cheerio.load(html)
  const items = $('body > div.content-wrapper > div.grid-row-prefooter > ul.FeaturedList > li > div.FeaturedList__card > div.FeaturedList__card-content')

  const itemProps = []
  const errors = []
  items.each((i, item) => {
    const props = {}
    try {
      props.title = $(item).find('div.FeaturedList__card-title > a.title-oeuvre > span').text().trim()
      if (!props.title) throw new Error(`No title found for item ${i}`)
      props.author = $(item).find('div.FeaturedList__card-title > p > span').text().trim()
      if (!props.author) throw new Error(`No author found for item ${i}`)
      props.type = parseType($(item).find('div.FeaturedList__card-title > p').text().replace(props.author, ''))
      if (!props.type) throw new Error(`Unknown type for item ${i}`)

      const [start, end, loc] = parseLocation($(item).find('div.FeaturedList__card-metadata > div.FeaturedList__metadata-location').text())
      if (!start) throw new Error(`Unable to parse location for item ${i}`)
      // console.log(location)
      //props.type = parseType($(item).find('div.FeaturedList__card-content > div.FeaturedList__card-title > p').text().replace(props.author, ''))
      // if (!props.type) throw new Error(`Unknown type for item ${i}`)
    } catch (err) {
      errors.push({message: err.message, context})
      return true  // continue iterating and ignore this item
    }
    itemProps.push(props)
  }).get()

  return [itemProps, errors]
}

getHtml(url)
  .then(html => {
    const [items, errors] = extractItems(html)
    console.log('items', items)
    console.log('errors', errors)
    logging.logger.info('Everything is good')
  })
  .catch(err => logging.logger.error(err))

