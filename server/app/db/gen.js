const uuid = require('uuid')
const moment = require('moment')
require('moment-timezone')
const fs = require('fs')

const files = ["127-rigoletto.json", "120-carmen.json", "126-eugene-oneguine.json", "121-trompe-la-mort.json", "125-wozzeck.json", "124-la-fille-de-neige.json", "128-la-cenerentola.json"]

const data = files.map(file => require(`./json/${file}`))

const shows = []
const perfs = []
const prices = []

data.forEach(show => {
  let location

  if (show.location.includes('Bastille')) {
    location = 'bastille'
  } else if (show.location.includes('Garnier')) {
    location = 'garnier'
  } else {
    throw new Error('Unexpected location ', show.location, 'on show', show.slug)
  }

  // Date TS will be rounded to the day
  const startDate = Date.parse(show.start_date)
  const endDate = Date.parse(show.start_date)
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
    throw new Error(`Invalid date string in show ${show.id}`)
  }

  shows.push(`INSERT INTO show VALUES (${show.id}, '${show.slug}', '${show.title}', '${show.author}', '${location}', '${startDate}', '${show.endDate}', ${show.last_update}, ${show.last_update});`)

  Object.keys(show.performances).forEach(date => {
    const id = uuid.v4()
    perfs.push(`INSERT INTO performance VALUES ('${id}', ${show.id}, '${date}');`)

    for (let s = 0, t; s < show.performances[date].length; s++) {
      t = show.performances[date][s][0]
      for (let i = 1, o; i < show.performances[date][s].length; i++) {
        o = show.performances[date][s][i]
        prices.push(`INSERT INTO price VALUES (${t}, '${id}', '${o[0]}', ${o[1]}, ${o[2]?1:0});`)
      }
    }
  })
})



const toFile = (file, lines) => {
  fs.writeFile(file, lines.join("\n"), function(err) {
      if (err) return console.log(err);
      console.log("The file was saved!");
  });
}

toFile('fixtures.sql', shows.concat(perfs).concat(prices))

