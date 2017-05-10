const Crawl = require('../models/Crawl')
const database = require('../db')

module.exports = class Price {
  constructor (row) {
    this.crawlId = row.crawlId
    this.performanceId = row.performanceId
    this.category = row.category
    this.price = row.price
    this.available = Number.isInteger(row.available) ? row.available > 0 : row.available
  }

  save () {
    const q = `INSERT INTO price VALUES (${this.crawlId}, ${this.performanceId}, '${this.category}', ${this.price}, ${this.available ? 1 : 0})`
    return database.db
      .run(q)
      .then(() => this)
  }
}
