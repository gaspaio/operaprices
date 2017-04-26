const moment = require('moment')

module.exports.nowDate = () => {
  return  moment().utc().hour(12).minutes(0).seconds(0).milliseconds(0).unix()
}

