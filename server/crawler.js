const crawler = require('./lib/crawler')
const CronJob = require('cron').CronJob
const logger = require('./lib/logging').logger
const config = require('config')

if (process.argv.length >= 2 && process.argv[2] === 'start') {
  const crawlJob = new CronJob( // eslint-disable-line no-unused-vars
    config.get('crawler_cron'),
    () => crawler.crawl().catch(err => {
      console.error(err)
      process.exit(1)
    }),
    () => logger.info('Crawler deamon stopped.'),
    true
  )
  logger.info(`Starting crawler deamon. Cron=${config.get('crawler_cron')}`)
} else {
  crawler.crawl().catch(err => console.error(err))
}

