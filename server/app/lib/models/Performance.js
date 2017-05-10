const Crawl = require('../models/Crawl')
const moment = require('moment')
const database = require('../db')

const FIELDS = ['showId', 'date', 'createdAt']

module.exports = class Performance {
  constructor (row) {
    this.id = 'id' in row ? row['id'] : null

    FIELDS.forEach(field => {this[field] = field in row ? row[field] : null})
  }

  upsert () {
    if (!this.date || !this.showId) throw Error(`Cannot insert performance without date and/or showId (sid=${this.showId}, date=${date})`)
    return database.db
      .get(`SELECT * FROM performance WHERE showId=${this.showId} AND date=${this.date}`)
      .then(row => {
        if (row) return new Performance(row)

        const now = this.createdAt = Crawl.get().startTime
        return database.db
          .run(`INSERT INTO performance (showId, date, createdAt) VALUES (${this.showId}, ${this.date}, ${now})`)
          .then(stmt => {
            this.id = stmt.lastID
            return this
          })
      })
  }
}
