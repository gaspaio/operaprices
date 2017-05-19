const utils = require('../utils')

module.exports = class Show {
  constructor (row = {}) {
    Show.getFields(true).forEach(field => {
      this[field] = field in row ? row[field] : null
    })

    if (this.saleOpen !== null) {
      this.saleOpen = Boolean(this.saleOpen)
    }
  }

  static getFields (id = false) {
    const out = [
      'slug', 'type', 'title', 'author', 'location', 'url', 'buyUrl', 'saleStartDate', 'saleOpen',
      'startDate', 'endDate', 'createdAt', 'updatedAt'
    ]
    if (id) out.unshift('id')
    return out
  }

  get active () {
    console.log('here')
    return this.endDate >= utils.nowDate()
  }

  update (item) {
    ['startDate', 'endDate', 'saleOpen', 'saleStartDate'].forEach(f => {
      if (item[f]) this[f] = item[f]
    })

    // Throw err if title, type, location, author changed ...
    return this
  }

  toObject () {
    const out = {}
    Show.getFields(true).forEach(f => {
      out[f] = this[f]
    })

    return out
  }
}
