const uuid = require('uuid')
const moment = require('moment')
const db = require('../db').db

let CURR_CRAWL

class Crawl {
  constructor (row) {
    this.id = row.id
    this.startTime = row.start_time
    this.endTime = row.end_time

    if (!(row.status in Crawl.statuses)) {
      throw Error(`Unknown status row value "${row.status}"`)
    }

    this.status = Crawl.statuses[row.status]
    this.stats = JSON.parse(row.stats)
    this.errors = JSON.parse(row.errors)
  }

  stop (time = null) {
    this.endTime = time || moment.utc().unix()
    this.status = Crawl.statuses.CRAWL_DONE
    const errors = JSON.stringify(this.errors).replace(/'/g, '')
    const q = `UPDATE OR FAIL crawl SET (end_time, status, stats, errors)=(${this.endTime}, '${this.status}', '${JSON.stringify(this.stats)}', '${errors}')`
    return db
      .run(q)
      .then(() => this)
  }

  get duration () {
    if (this.endTime === 0) return -1
    return this.endTime - this.startTime
  }

  addError (err) {
    if (!(err instanceof Error)) {
      err = Error(`Param should be instance of Error: ${err}`)
    }

    console.log(err)

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

  toString () {
    const out = this.stats
    out.crawl = {
      start_time: this.startTime,
      end_time: this.endTime,
      duration: this.duration
    }

    return JSON.stringify(out)
  }

  static get statuses () {
    return {
      CRAWL_STARTED: 'CRAWL_STARTED',
      CRAWL_DONE: 'CRAWL_DONE'
    }
  }

  static start (time = null) {
    const startTime = time || moment.utc().unix()
    const status = Crawl.statuses.CRAWL_STARTED

    const q = `INSERT INTO crawl (start_time, status) VALUES (${startTime}, '${status}')`
    return db
      .run(q)
      .then(stmt => Crawl.load(stmt.lastID))
  }

  static load (id) {
    return db
      .get(`SELECT * FROM crawl WHERE id = ${id}`)
      .then(row => {
        if (!row) throw Error(`Unknown crawl with ID '${id}'`)
        return new Crawl(row)
      })
  }
}

module.exports.start = (time = null) => {
  return Crawl.start(time).then(c => {
    CURR_CRAWL = c
  })
}

module.exports.stop = (time = null) => {
  return CURR_CRAWL.stop()
}

module.exports.get = () => CURR_CRAWL

