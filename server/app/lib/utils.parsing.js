const moment = require('moment')
const cheerio = require('cheerio')

const MONTHS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']


const showType = str => {
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
      throw Error(`Unknown show type string :${str}`)
      break
  }
  return ret
}

const link2slug = href => {
  const matches = /^https?:\/\/www\.operadeparis\.fr\/.*\/([^\/]+)$/.exec(href.trim())
  if (!matches) throw Error(`Unable to get slug from link: ${href}`)
  return matches[1]
}

const parseSaleDate = str => {
  // Ouverture &#xE0; la vente le 30 mai 2017<br><a href="https://www.operadeparis.fr/billetterie/230-pelleas-et-melisande">Voir les s&#xE9;ances</a>
  const failMsg = `Unable to parse date sale string "${str}"`

  const strClean = str.replace(/\s\s+/g, ' ').trim().toLowerCase()

  matches = /^.*vente le ([0-9]{2}) (.*) ([0-9]{4})voir .*$/.exec(strClean)
  if (!matches) throw new Error(failMsg)
  if (!MONTHS.includes(matches[2].trim())) throw new Error(failMsg)
  let [day, month, year] = [parseInt(matches[1]), MONTHS.indexOf(matches[2]), parseInt(matches[3])]

  const time = moment.utc([year, month, day, 12, 0, 0, 0])
  if (!time.isValid()) throw new Error(failMsg)
  return time.unix()
}

const featuredItem = html => {
  const item = {}

  item.title = html.find('div.FeaturedList__card-title > a.title-oeuvre > span').text().trim()
  if (!item.title) throw new Error(`No title found.`)

  item.url = html.find('div.FeaturedList__card-title > a.title-oeuvre').attr('href')
  if (!item.url) throw new Error(`No showLink found.`)
  item.slug = link2slug(item.url)

  item.author = html.find('div.FeaturedList__card-title > p > span').text().trim()
  if (!item.author) throw new Error(`No author found.`)

  item.type = showType(html.find('div.FeaturedList__card-title > p').text().replace(item.author, ''))
  if (!item.type) throw new Error(`Unknown type.`)

  const locationStr = html.find('div.FeaturedList__card-metadata > div.FeaturedList__metadata-location').text().trim()
  const [startDate, endDate, location] = locationString(locationStr)
  Object.assign(item, {startDate, endDate, location})
  if (item.startDate > item.endDate || !item.location) throw new Error(`Unable to parse location.`)
      //props.buyLink = $(item).find('a.FeaturedList__reserve-btn').attr('href') || ''
      // if buyLink, extract 'id' and 'slug'
  return item
}




const buyLink = str => {
  const matches = /^https?:\/\/www\.operadeparis\.fr\/billetterie\/([0-9]+-[^\/]+)$/.exec(str.trim())
  if (!matches || matches.length != 2) throw new Error(`Unable to parse buyLink for item ${i}`)
  return matches[1]
}

const strClean = str => {
  return str.replace(/\s\s+/g, ' ').trim().toLowerCase()
}

const performanceDate = (day, hour) => {
  console.log("got ", day, hour)
  const failMsg = `Unable to parse performance date "${day}" "${hour}"`
  const parts = strClean(day).split(' ')

  if (parts.length != 4) throw Error(failMsg)
  if (!MONTHS.includes(parts[2])) throw Error(failMsg)
  let [d, m, y] = [parseInt(parts[1], MONTHS.indexOf(parts[2], parts[3]))]

  ****
}

const locationString = str => {
  let start, end, loc, parts, dateParts, startParts, endParts
  const failMsg = `Unable to parse location string "${str}"`

  parts = str.replace(/\s\s+/g, ' ').trim().split(' — ')
  if (parts.length != 2) throw new Error(failMsg)

  loc = parts[0].trim()

  // Test full date range
  dateParts = /^du\s(.+)\sau\s(.+)$/.exec(parts[1])
  if (dateParts) {
    if (dateParts.length != 3) throw new Error(failMsg)

    startParts = dateParts[1].split(' ')
    endParts = dateParts[2].split(' ')

    if (endParts.length != 3) throw new Error(failMsg)
    if (!startParts.length || startParts.length > 3) throw new Error(failMsg)

    if (!MONTHS.includes(endParts[1].trim())) throw new Error(failMsg)
    let [year, month, day] = [parseInt(endParts[2]), MONTHS.indexOf(endParts[1]), parseInt(endParts[0])]
    end = moment.utc([year, month, day, 12, 0, 0, 0])
    if (!end.isValid) throw new Error(failMsg)

    day = parseInt(startParts[0])
    if (startParts.length >= 2 ) {
      if (!MONTHS.includes(startParts[1].trim())) throw new Error(failMsg)
      month = MONTHS.indexOf(startParts[1])
    }
    if (startParts.length == 3) {
      year = parseInt(startParts[2])
    }

    start = moment.utc([year, month, day, 12, 0, 0, 0])
    if (!start.isValid()) throw new Error(failMsg)

    return [start.unix(), end.unix(), loc]
  }

  dateParts = /^le\s(.*)\sà\s[0-9h]+$/.exec(parts[1])
  if (dateParts) {
    startParts = dateParts[1].split(' ')
    if (startParts.length != 3) throw new Error(failMsg)
    if (!MONTHS.includes(startParts[1].trim())) throw new Error(failMsg)
    const [day, month, year] = [parseInt(startParts[0]), MONTHS.indexOf(startParts[1]), parseInt(startParts[2])]
    start = moment.utc([year, month, day, 12, 0, 0, 0])
    if (!start.isValid()) throw new Error(failMsg)
    return [start.unix(), start.unix(), loc]
  }

  throw new Error(failMsg)
}


module.exports = {featuredItem, locationString, buyLink, showType, parseSaleDate, performanceDate}

