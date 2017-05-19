const moment = require('moment')
const db = require('../db')
const logger = require('../logging').logger

let CURR_CRAWL

class Crawl {
  constructor (row) {
    ['id', 'startTime', 'endTime'].forEach(f => {
      this[f] = f in row ? row[f] : null
    })

    this.status = null
    if ('status' in row) {
      if (!(row.status in Crawl.statuses)) throw Error(`Unknown status row value "${row.status}"`)
      this.status = Crawl.statuses[row.status]
    }

    this.stats = 'stats' in row ? JSON.parse(row.stats) : {}
    this.errors = 'errors' in row ? JSON.parse(row.errors) : []
  }

  stop (time = null) {
    this.endTime = time || moment.utc().unix()
    this.status = Crawl.statuses.CRAWL_DONE
    return db.crawlStop(this).then(() => {
      logger.info('Crawl stopped', this.toObject())
      return this
    })
  }

  get duration () {
    if (this.endTime === 0) return -1
    return this.endTime - this.startTime
  }

  addError (err) {
    if (!(err instanceof Error)) {
      err = Error(`Param should be instance of Error: ${err}`)
    }

    logger.error(err.message, err)
    const e = {message: err.message, stack: err.stack.split('\n').map(s => s.trim())}
    this.errors.push(e)
  }

  setStat (key, val) {
    this.stats[key] = val
  }

  getStat (key, def) {
    if (!(key in this.stats)) return def
    return this.stats[key]
  }

  incStat (key, val = 1) {
    if (!(key in this.stats)) this.stats[key] = 0
    this.stats[key] += val
  }

  toObject () {
    return {
      startTime: this.startTime,
      endTime: this.endTime,
      duration: this.duration,
      stats: this.stats,
      errors: this.errors
    }
  }

  toString () {
    return JSON.stringify(this.toObject())
  }

  static get statuses () {
    return {
      CRAWL_STARTED: 'CRAWL_STARTED',
      CRAWL_DONE: 'CRAWL_DONE'
    }
  }

  static start (time = null) {
    const crawl = new Crawl({
      startTime: time || moment.utc().unix(),
      status: Crawl.statuses.CRAWL_STARTED
    })

    return db.crawlStart(crawl).then(obj => {
      logger.info('Crawl started', {time: obj.startTime})
      return obj
    })
  }
}

module.exports.start = async (time = null) => {
  CURR_CRAWL = await Crawl.start(time)
}

module.exports.stop = (time = null) => {
  return CURR_CRAWL.stop()
}

module.exports.get = () => CURR_CRAWL

module.exports.Crawl = Crawl
