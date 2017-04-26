module.exports = class Crawl {
  constructor (row) {
    this.id = row.id
    this.time = row.time
    this.status = 'status' in row ? row.status : null
    this.comments = 'comments' in row ? row.comments : null
  }
}

