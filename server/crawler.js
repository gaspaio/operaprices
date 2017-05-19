const crawler = require('./lib/crawler')
const CronJob = require('cron').CronJob
const logger = require('./lib/logging').logger
const config = require('config')

if (process.argv.length >= 2 && process.argv[2] === 'start') {
  const crawlJob = new CronJob( // eslint-disable-line no-unused-vars
    config.get('crawler.cron'),
    () => crawler.crawl().catch(err => {
      console.error(err)
      process.exit(1)
    }),
    () => logger.info('Crawler deamon stopped', config.get('crawler')),
    true
  )
  logger.info('Starting crawler deamon', config.get('crawler'))
} else {
  crawler.crawl().catch(err => console.error(err))
}
