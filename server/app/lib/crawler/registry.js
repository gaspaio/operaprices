
const ERRORS = []
const STATS = {
  requests: 0,
  start: 0,
  end: 0
}

module.exports.addError = err => ERRORS.push(err)
module.exports.getErrors = () => ERRORS

module.exports.addStat = (name, val) => {
  STATS[name] = val
  return STATS
}

module.exports.request = () => {
  STATS['requests'] += 1
  return STATS
}

module.exports.getStats = () => STATS

