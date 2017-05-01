const moment = require('moment')

module.exports.parseLocationString = str => {
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
