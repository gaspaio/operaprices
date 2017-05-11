module.exports = class Price {
  constructor (row) {
    this.crawlId = row.crawlId
    this.performanceId = row.performanceId
    this.category = row.category
    this.price = row.price
    this.available = Number.isInteger(row.available) ? row.available > 0 : row.available
  }
}
