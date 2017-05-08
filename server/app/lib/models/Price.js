module.exports = class Price {
  constructor (row) {
    this.crawlId = row.crawl_id
    this.performanceId = row.performanceId
    this.category = row.category
    this.price = row.price
    this.available = row.available > 0
  }
}
