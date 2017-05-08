const utils = require('../utils')
const database = require('../db')
const Crawl = require('../models/Crawl')
const moment = require('moment')

const FIELDS = [
  'slug', 'type', 'title', 'author', 'location', 'url', 'buyUrl', 'saleStartDate', 'saleOpen',
  'startDate', 'endDate', 'createdAt', 'updatedAt'
]

module.exports = class Show {
  constructor (row = {}) {
    this.id = 'id' in row ? row['id'] : null

    FIELDS.forEach(field => {this[field] = field in row ? row[field] : null})

    if (this.saleOpen !== null) {
      this.saleOpen = Boolean(this.saleOpen)
    }
  }

  get active () {
    return this.endDate >= utils.nowDate()
  }

  static loadBySlug (slug) {
    return database.db
      .get(`SELECT * FROM show WHERE slug='${slug}'`)
      .then(row => {
        if (!row) return row
        return new Show(row)
      })
  }

  static createFromItem (item) {
    return new Show(item)
  }

  updateFromItem (item) {
    ['startDate', 'endDate', 'saleOpen', 'saleStartDate'].forEach(f => {
      if (!item[f]) return
      this[f] = item[f]
    })

    // Throw err if title, type, location, author changed ...
  }

  save (nowDate = null) {
    const time = nowDate || moment.utc().unix()
    this.updatedAt = time
    if (!this.createdAt) {
      this.createdAt = time
    }

    const values = [
      `'${this.slug}'`,
      `'${this.type}'`,
      `'${utils.sqlClean(this.title)}'`,
      `'${utils.sqlClean(this.author)}'`,
      `'${utils.sqlClean(this.location)}'`,
      `'${utils.sqlClean(this.url)}'`,
      `'${utils.sqlClean(this.buyUrl)}'`,
      `${this.saleStartDate}`,
      `${this.saleOpen === null ? null : (this.saleOpen ? 1 : 0)}`,
      `${this.startDate}`,
      `${this.endDate}`,
      `${this.createdAt}`,
      `${this.updatedAt}`
    ].join(',')

    let q
    if (!this.id) {
      q = `INSERT OR FAIL INTO show (${FIELDS}) VALUES (${values})`
    } else {
      q = `UPDATE OR FAIL show SET (${FIELDS})=(${values}) WHERE id = ${this.id}`
    }

    database.db.run(q).then(stmt => {
      if (!this.id) {
        this.id = stmt.lastID
      }

      return this
    })
  }

    /*
  toObject () {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      author: this.author,
      location: this.location,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      active: this.active
    }
  }
  */
}

