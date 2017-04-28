module.exports = class Performance {
  constructor (row) {
    this.id = 'id' in row ? row.id : null
    this.showId = 'show_id' in row ? row.show_id : null
    this.date = 'date' in row ? row.date : null
    this.prices = null
  }

  set prices (priceSeries) {
    // [{ crawl: <P>, prices: [<P>] }]
    this.prices = priceSeries
  }
}
