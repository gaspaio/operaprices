const FIELDS = ['showId', 'date', 'createdAt']

module.exports = class Performance {
  constructor (row) {
    this.id = null
    FIELDS.forEach(field => { this[field] = null })
    this.update(row)
  }

  update (row) {
    Object.keys(row).forEach(f => { this[f] = row[f] })
    return this
  }
}
