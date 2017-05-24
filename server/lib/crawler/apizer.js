const db = require('../db')
const config = require('config')
const logger = require('../logging').logger
const fs = require('fs')
const path = require('path')
const dataUtils = require('../utils')

const showAddIncludes = async (showObj, lastCrawl) => {
  const showIsActive = showObj.endDate >= dataUtils.nowDate()
  if (!showObj.saleOpen || !showIsActive) return showObj

  const priceMap = await db.getLowestPerformancePrices(showObj.id)

  showObj.cheapestPerformances = dataUtils.findCheapestPerformances(priceMap, lastCrawl.startTime)
  if (showObj.cheapestPerformances.length > 0) {
    // All the cheapest perfs have the same price
    showObj.cheapestPrice = showObj.cheapestPerformances[0][1]
  }

  showObj.tendency = dataUtils.findCheapestTendency(priceMap)

  return showObj
}

const showsData = async () => {
  const out = {meta: {}, shows: []}

  const lastCrawl = await db.getLastCrawl()
  out.meta.lastCrawl = lastCrawl.toObject()

  let shows = await db.getShows()
  out.shows = await Promise.all(
    shows.map(s => showAddIncludes(s.toObject(), lastCrawl))
  )

  return out
}

module.exports.generate = async () => {
  const shows = await showsData()

  // Get absolute root dit for files
  let filesPath = path.join(dataUtils.dataDir(), 'json')

  return new Promise((resolve, reject) => {
    fs.writeFile(`${filesPath}/shows.json`, JSON.stringify(shows, null, '  '), err => {
      if (err) reject(err)
      resolve()
    })
  })
}

