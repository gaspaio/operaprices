const uuid = require('uuid')
const moment = require('moment')
require('moment-timezone')
const fs = require('fs')

const files = ["127-rigoletto.json", "120-carmen.json", "126-eugene-oneguine.json", "121-trompe-la-mort.json", "125-wozzeck.json", "124-la-fille-de-neige.json", "128-la-cenerentola.json"]

const data = files.map(file => require(`./json/${file}`))

const shows = []
const perfs = []
const prices = []
const crawls = {}

data.forEach(show => {
  let location

  if (show.location.includes('Bastille')) {
    location = 'Opéra Bastille'
  } else if (show.location.includes('Garnier')) {
    location = 'Palais Garnier'
  } else {
    throw new Error('Unexpected location ', show.location, 'on show', show.slug)
  }

  // Date TS will be rounded to the day
  let startDate, endDate
  try {
    startDate = moment(`${show.start_date}T12:00:00.000Z`)
    endDate = moment(`${show.end_date}T12:00:00.000Z`)
  } catch (err) {
    throw new Error(`Invalid date string in show ${show.id}: ${err.message}`)
  }

  shows.push(`INSERT INTO show VALUES (${show.id}, 'opera', '${show.slug}', '${show.title}', '${show.author}', '${location}', '${endDate.unix()}', '${endDate.unix()}', ${show.last_update}, ${show.last_update});`)

  Object.keys(show.performances).forEach(date => {
    let ts
    try {
      ts = moment.tz(date, 'Europe/Paris')
    } catch (err) {
      throw Error(`Invalid performance date for show ${show.slug}: ${date}`)
    }

    const id = uuid.v4()
    perfs.push(`INSERT INTO performance VALUES ('${id}', ${show.id}, '${ts.unix()}');`)

    for (let s = 0, crawlId, t; s < show.performances[date].length; s++) {
      t = show.performances[date][s][0]
      if (!(t in crawls)) {
        crawls[t] = uuid.v4()
      }
      for (let i = 1, o; i < show.performances[date][s].length; i++) {
        o = show.performances[date][s][i]
        prices.push(`INSERT INTO price VALUES ('${crawls[t]}', '${id}', '${o[0]}', ${o[1]}, ${o[2]? 1 : 0});`)
      }
    }
  })
})

const crawlList = Object.keys(crawls).map(time => `INSERT INTO crawl VALUES ('${crawls[time]}', ${time}, 'ok', '');`)

const toFile = (file, lines) => {
  fs.writeFile(file, lines.join("\n"), function(err) {
      if (err) return console.log(err);
      console.log("The file was saved!");
  });
}

toFile('fixtures.sql', crawlList.concat(shows).concat(perfs).concat(prices))

