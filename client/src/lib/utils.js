import * as moment from 'moment-timezone'

const TZ = 'Europe/Paris'

const showDateString = (start, end) => {
  let duFormat = 'D'
  const auFormat = 'D MMMM YYYY'

  const sd = moment.tz(start, TZ)
  const ed = moment.tz(end, TZ)

  if (sd.year() !== ed.year()) {
    duFormat += ' MMMM YYYY'
  } else if (sd.month() !== ed.month()) {
    duFormat += ' MMMM'
  }

  return `From ${sd.format(duFormat)} to ${ed.format(auFormat)}`
}

const singleDateString = (date, format) => {
  let fstr
  switch (format) {
    case 'long':
      fstr = 'dddd, D MMMM YYYY'
      break
    case 'medium':
    default:
      fstr = 'D MMMM YYYY'
      break
  }

  return moment.tz(date, TZ).format(fstr)
}

export { showDateString, singleDateString }
