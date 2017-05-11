const utils = require('../utils')
const database = require('../db')
const Crawl = require('../models/Crawl')
const moment = require('moment')

module.exports = class Show {
  constructor (row = {}) {
    this.id = 'id' in row ? row['id'] : null

    Show.getFields().forEach(field => {this[field] = field in row ? row[field] : null})

    if (this.saleOpen !== null) {
      this.saleOpen = Boolean(this.saleOpen)
    }
  }

  static getFields () {
    return [
      'slug', 'type', 'title', 'author', 'location', 'url', 'buyUrl', 'saleStartDate', 'saleOpen',
      'startDate', 'endDate', 'createdAt', 'updatedAt'
    ]
  }

  get active () {
    return this.endDate >= utils.nowDate()
  }

  update (item) {
    ['startDate', 'endDate', 'saleOpen', 'saleStartDate'].forEach(f => {
      if (item[f]) this[f] = item[f]
    })

    // Throw err if title, type, location, author changed ...
    return this
  }
}
