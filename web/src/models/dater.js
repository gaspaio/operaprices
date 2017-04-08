const moment = require('moment-timezone')
const TZ = 'Europe/Paris'

export default class Show {
  constructor (obj) {
    this.validate(obj)

    Object.keys(obj).forEach(key => {
      switch (key) {
        case 'start_date':
          this.start_date = moment.tz(obj['start_date'], TZ)
          break
        case 'end_date':
          this.end_date = moment.tz(obj['end_date'], TZ)
          break
        default:
          this[key] = obj[key]
      }
    })

    const today = moment.tz(TZ)
    today.startOf('date')
    this.isOn = today <= this.end_date
    this.isRunning = today >= this.start_date && today <= this.end_date
  }

  validate (show) {
    const start = moment.tz(show['start_date'], TZ)
    const end = moment.tz(show['end_date'], TZ)

    if (start >= end) {
      throw Error(`start date (${start}) should be smaller than end date (${end}).`)
    }

    Object.keys(show['performances']).forEach(ddStr => {
      const dd = moment.tz(ddStr, TZ)
      dd.startOf('date')
      if (dd >= start && dd <= end) return
      throw new Error(
        `performance date ${dd} should be between the show start ${start} & end ${end} dates.`
      )
    })
  }

  getCheapestTs () {
    // Compute min prices for all performances, by sample
    const minPrices = Object.keys(this.performances).map(pDate =>
      this.performances[pDate].map(ts =>
        [ts[0], ts.slice(1).reduce((acc, cat) => {
          if (!cat[2]) return acc
          return (acc === null) ? cat[1] : Math.min(acc, cat[1])
        }, null)]
      )
    )

    // for each sample, get the cheapest price accross all performances
    const tsDict = {}
    minPrices.forEach(perf => {
      perf.forEach(item => {
        if (!tsDict[item[0]]) {
          tsDict[item[0]] = item[1]
          return
        }
        if (!item[1]) return
        tsDict[item[0]] = Math.min(item[1], tsDict[item[0]])
      })
    })

    // Build sorted array
    const ts = Object.keys(tsDict).map(t => [t, tsDict[t]])
    ts.sort((s1, s2) => s1[0] - s2[0])
    return ts
  }

  getTendency (days) {
    const lastPrices = this.getCheapestTs().slice(-days).reverse().map(info => info[1])
    for (let i = 1; i < lastPrices.length; i++) {
      if (lastPrices[i] === lastPrices[i - 1]) continue
      return (lastPrices[i - 1] - lastPrices[i]) / Math.abs(lastPrices[i - 1] - lastPrices[i])
    }
    return 0
  }

  getCheapestCurrentPerformances () {
    let minPrice, minCat, minPerfs
    Object.keys(this.performances).forEach(pDate => {
      this.performances[pDate][this.performances[pDate].length - 1].forEach(cat => {
        if (!cat[2]) return
        if (minPrice === undefined || cat[1] < minPrice) {
          minCat = cat[0]
          minPrice = cat[1]
          minPerfs = [pDate]
          return
        }
        if (cat[1] === minPrice) {
          minPerfs.push(pDate)
          return
        }
      })
    })
    return [minPrice, minCat, minPerfs]
  }

  getDates () {
    let duFormat = 'dddd Do'
    const auFormat = 'dddd Do MMMM YYYY'

    if (this.start_date.year() !== this.end_date.year()) {
      duFormat += ' MMMM YYYY'
    } else if (this.start_date.month() !== this.end_date.month()) {
      duFormat += ' MMMM'
    }

    return `From ${this.start_date.format(duFormat)} to ${this.end_date.format(auFormat)}`
  }
}

