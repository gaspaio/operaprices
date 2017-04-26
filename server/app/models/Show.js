const utils = require('./utils')

module.exports = class Show {
  constructor (row = {}) {
    this.id =   'id' in row   ? row.id : null
    this.slug = 'slug' in row ? row.slug : null
    this.title = 'title' in row ? row.title : null
    this.author = 'author' in row ? row.author : null

    if (!('location' in row)) this.location = null
    if (!['bastille', 'garnier'].includes(row.location)) {
      throw new Error(`Unexpected value for location: ${row.location}`)
    }
    this.location = row.location

    this.startDate  = 'start_date'  in row ? row.start_date : null
    this.endDate    = 'end_date'    in row ? row.end_date : null
    this.createdAt  = 'created_at'  in row ? row.created_at : null
    this.updatedAt  = 'updated_at'  in row ? row.updated_at : null

    // Computed fields
    this.active = this.startDate >= utils.nowDate()
  }

  toJson () {
    return {
      id: this.id,
      slug: this.slug,
      title: this.title,
      author: this.author,
      location: this.location,
      startDate: this.startDate,
      endDate: this.endDate,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      active: this.active
    }
  }
}

