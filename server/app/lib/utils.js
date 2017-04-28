const moment = require('moment')

module.exports.nowDate = () => {
  return  moment().utc().hour(12).minutes(0).seconds(0).milliseconds(0).unix()
}

module.exports.now = () => moment().utc().unix()

module.exports.asyncWrapper = fn => (...args) => fn(...args).catch(args[2])

module.exports.map2object = mm => {
  const ret = {}
  for (var [key, value] of mm) {
    ret[key] = value
  }
  return ret
}

module.exports.findCheapestPerformances = (priceMap, lastCrawlTime) => {
  // assumes each price series is sorted by crawl time
  let data = [] // ([perf, price, cat])
  let minPrice

  // Find when was the last crawl

  for (let [perf, series] of priceMap) {
    const lastItem = series[series.length - 1]
    // Ignore items that were not found in the last crawl (complete performances, ...)
    if (lastItem[0] != lastCrawlTime) continue

    //console.log('last item for', perf, lastItem)
    if (!minPrice || minPrice > lastItem[1]) {
      //console.log('setting min price to', lastItem[1])
      data = [[perf, lastItem[1], lastItem[2]]]
      minPrice = lastItem[1]
    } else if (lastItem[1] > minPrice) {
      continue
    }
    else if (lastItem[1] == minPrice) {
      data.push([perf, lastItem[1], lastItem[2]])
    }
  }

  return data
}

module.exports.findCheapestTendency = priceMap => {
  // Find min price for each crawl -> series of min prices
  let crawlMap = new Map()
  for (let [perf, series] of priceMap) {
    // For each performance
    const dd = perf == 1499967000
    for(let i = 0, curr; i < series.length; i++) {
      if (!crawlMap.has(series[i][0])) {
        crawlMap.set(series[i][0], series[i][1])
      } else {
        curr = crawlMap.get(series[i][0])
        if (curr > series[i][1]) {
          crawlMap.set(series[i][0], series[i][1])
        }
      }
    }
  }
  // Cast map to array and reverse sort
  const priceSeries = [...crawlMap]
  priceSeries.sort((i1, i2) => i2[0] - i1[0])

  // reduce to tendency
  for (let i=1; i < priceSeries.length;i++) {
    if (priceSeries[i][1] == priceSeries[i - 1][1]) continue
    return (priceSeries[i - 1][1] - priceSeries[i][1])/Math.abs(priceSeries[i -1][1] - priceSeries[i][1])
  }
  return 0
}
