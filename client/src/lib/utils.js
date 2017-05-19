import * as moment from 'moment-timezone'

const TZ = 'Europe/Paris'

const showDateString = (start, end) => {
  let duFormat = 'dddd Do'
  const auFormat = 'dddd Do MMMM YYYY'

  const sd = moment.tz(start, TZ)
  const ed = moment.tz(end, TZ)

  if (sd.year() !== ed.year()) {
    duFormat += ' MMMM YYYY'
  } else if (sd.month() !== ed.month()) {
    duFormat += ' MMMM'
  }

  return `From ${sd.format(duFormat)} to ${ed.format(auFormat)}`
}

const singleDateString = date => moment.tz(date, TZ).format('dddd Do MMMM')

export { showDateString, singleDateString }
