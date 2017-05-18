const express = require('express')
const utils = require('../utils')
const db = require('../db')

const apiRouter = module.exports = express.Router();

const showAddIncludes = async (showObj, includes, lastCrawl) => {
  if (!includes.includes('cheapest') && !includes.includes('tendency')) return showObj

  const showIsActive = showObj.endDate >= utils.nowDate()
  if (!showObj.saleOpen || !showIsActive) return showObj

  const priceMap = await db.getLowestPerformancePrices(showObj.id)

  showObj.cheapestPerformances = showObj.tendency = null
  if (includes.includes('cheapest')) {
    showObj.cheapestPerformances = utils.findCheapestPerformances(priceMap, lastCrawl.startTime)
  }
  if (includes.includes('tendency')) {
    showObj.tendency = utils.findCheapestTendency(priceMap)
  }

  return showObj
}

apiRouter.get('/shows', utils.asyncWrapper(async (req, res) => {
  // ?include=lowestActivePrice,tendency&active=false
  // TODO: validate params & param accepted values
  const params = Object.assign({
    include: null,
    active: null,
    saleOpen: null
  }, req.query)

  const includes = params.include !== null ? params.include.split(',') : [];
  ['active', 'saleOpen'].forEach(p => {
    if (params[p] === null) return
    params[p] = params[p] === 'true'
  })

  const out = {meta: {}, shows: []}
  const lastCrawl = await db.getLastCrawl()
  out.meta.lastCrawl = lastCrawl.toObject()

  let shows = await db.getShows(params)
  out.shows = await Promise.all(
    shows.map(s => showAddIncludes(s.toObject(), includes, lastCrawl))
  )

  res.json(out)
}))

apiRouter.get('/shows/:id', utils.asyncWrapper(async (req, res) => {
  let includes = 'include' in req.query ? req.query.include : null
  includes = includes !== null ? includes.split(',') : [];

  let show = await db.getShow(req.params.id)

  if (!show) {
    res.status(404).json({status: 404, message: 'Page not found'})
    return
  }

  const lastCrawl = await db.getLastCrawl()
  const showObj = await showAddIncludes(show.toObject(), includes, lastCrawl)

  res.json(showObj)
}))

