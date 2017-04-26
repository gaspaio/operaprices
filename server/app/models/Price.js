module.exports = class Price {
  constructor (row) {
    this.crawlId = row.crawl_id
    this.performanceId = row.performanceId
    this.category = row.category
    this.price = row.price
    this.available = row.available > 0
    this.crawl = null
  }

  set crawl (c) {
    this.crawl = c
  }
}
