const moment = require('moment')

module.exports.showType = str => {
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

module.exports.featuredItem = html => {
  const item = {}

  item.title = $(html).find('div.FeaturedList__card-title > a.title-oeuvre > span').text().trim()
  if (!item.title) throw new Error(`No title found.`)

  item.url = $(html).find('div.FeaturedList__card-title > a.title-oeuvre').attr('href')
  if (!item.url) throw new Error(`No showLink found.`)

  item.author = $(html).find('div.FeaturedList__card-title > p > span').text().trim()
  if (!item.author) throw new Error(`No author found.`)

  item.type = parseType($(html).find('div.FeaturedList__card-title > p').text().replace(item.author, ''))
  if (!item.type) throw new Error(`Unknown type.`)

  const locationStr = $(html).find('div.FeaturedList__card-metadata > div.FeaturedList__metadata-location').text().trim()
  const [startDate, endDate, location] = locationString(locationStr)
  Object.assign(item, {startDate, endDate, location})
  if (item.startDate > item.endDate || !item.location) throw new Error(`Unable to parse location.`)
      //props.buyLink = $(item).find('a.FeaturedList__reserve-btn').attr('href') || ''
      // if buyLink, extract 'id' and 'slug'
      //props.slug = ''
  return item
}

module.exports.buyLink = str => {
  const matches = /^https?:\/\/www\.operadeparis\.fr\/billetterie\/([0-9]+-[^\/]+)$/.exec(str.trim())
  if (!matches || matches.length != 2) throw new Error(`Unable to parse buyLink for item ${i}`)
  return matches[1]
}

const locationString = str => {
  let start, end, loc, parts, dateParts, startParts, endParts
  const failMsg = `Unable to parse location string "${str}"`

  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin',
                  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

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

    if (!months.includes(endParts[1].trim())) throw new Error(failMsg)
    let [year, month, day] = [parseInt(endParts[2]), months.indexOf(endParts[1]), parseInt(endParts[0])]
    end = moment.utc([year, month, day, 12, 0, 0, 0])
    if (!end.isValid) throw new Error(failMsg)

    day = parseInt(startParts[0])
    if (startParts.length >= 2 ) {
      if (!months.includes(startParts[1].trim())) throw new Error(failMsg)
      month = months.indexOf(startParts[1])
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
    if (!months.includes(startParts[1].trim())) throw new Error(failMsg)
    const [day, month, year] = [parseInt(startParts[0]), months.indexOf(startParts[1]), parseInt(startParts[2])]
    start = moment.utc([year, month, day, 12, 0, 0, 0])
    if (!start.isValid()) throw new Error(failMsg)
    return [start.unix(), start.unix(), loc]
  }

  throw new Error(failMsg)
}


module.exports = {featuredItem}
