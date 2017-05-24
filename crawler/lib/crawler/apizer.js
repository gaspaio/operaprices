const db = require('../db')
const config = require('config')
const logger = require('../logger')
const fs = require('fs')
const path = require('path')
const exec = require('child_process').exec
const dataUtils = require('../utils')

const showAddIncludes = async (showObj, lastCrawl) => {
  showObj.cheapestPerformances = []
  showObj.cheapestPrice = null
  showObj.tendency = null

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

  let shows = await db.getShows({active: true})
  out.shows = await Promise.all(
    shows.map(s => showAddIncludes(s.toObject(), lastCrawl))
  )

  return out
}

module.exports.update = async () => {
  const shows = await showsData()

  // Get absolute root dir for files
  let filesPath = path.join(dataUtils.dirs('data'), 'json')

  return new Promise((resolve, reject) => {
    // TODO Delete all files in filesPath
    fs.writeFile(`${filesPath}/shows.json`, JSON.stringify(shows, null, '  '), err => {
      if (err) reject(err)
      logger.info(`Generated api files at ${filesPath}`)
      resolve()
    })
  }).then(() => new Promise((resolve, reject) => {
    const pushop = path.normalize(path.join(__dirname, '..', '..', 'scripts', 'pushop.sh'))
    const cmd = `${pushop} ${filesPath} ${dataUtils.dirs('tmp')} ${config.get('push_api') ? 'true' : 'false'}`
    const out = {stdout: '', stderr: ''}

    const proc = exec(cmd)
    proc.stdout.on('data', data => out.stdout += data)
    proc.stderr.on('data', data => out.stderr += data)

    proc.on('exit', code => {
      if (code === 0) {
        logger.info('Succefully pushed API files to repo')
        logger.debug('git output: ', out)
        resolve(code)
      } else {
        const err = Error('Unable to push api files to github  repo')
        err.cxt = 'Repo update'
        err.meta = {
          code,
          stdout: out.stdout,
          stderr: out.stderr
        }
        reject(err)
      }
    })
  }))
}

