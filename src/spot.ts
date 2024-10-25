import { IncomingMessage, ServerResponse } from 'http';

const http = require('http')
const server = http.createServer()
const moment = require('moment')
const NodeCache = require('node-cache')
const CronJob = require('cron').CronJob

var utils = require("./utils/utils");
var rootController = require('./controller/rootController')
var queryController = require('./controller/queryController')
var linksController = require('./controller/linksController')
var storeController = require('./controller/storeController')

require('log-timestamp')(function () {
  return '[ ' + moment(new Date()).format('YYYY-MM-DD T HH:mm:ss ZZ') + ' ] %s'
})

require('console')

const protocol: string = 'http'
const port: number = 8089
const timeZone = 'Europe/Helsinki'

const spotCache = new NodeCache()

spotCache.on('set', function (key: string, value: Object) {
  storeController.updateStoredResultWhenChanged(key, JSON.stringify(value))
})

server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  console.log('Request url = ' + `${protocol}://${req.headers.host}` + req.url)

  if (!utils.isCacheReady(spotCache)) {
    await rootController.updatePrices(spotCache)
    await rootController.updateCurrentPrice(spotCache)
  }

  if (req.url === '/current') {
    rootController.handleCurrent({ res: res, cache: spotCache })
  } else if (req.url === '/') {
    rootController.handleRoot({ res: res, cache: spotCache })
  } else if (req.url?.startsWith('/query')) {
    queryController.handleQuery({ res: res, req: req, cache: spotCache })
  } else if (req.url?.startsWith('/links')) {
    linksController.handleLinks({ res: res, req: req, cache: spotCache })
  } else {
    res.statusCode = 404
    res.end('Not found')
  }
})

function resetPrices() {
  storeController.resetStoredFiles()
  console.log(spotCache.getStats())
  spotCache.flushAll()
  console.log('Cache has been flushed')
} 

// every minute
// eslint-disable-next-line no-new
new CronJob(
  '* * * * *',
  function () {
    rootController.updatePrices(spotCache)
  },
  null,
  true,
  timeZone
)

// every hour
// eslint-disable-next-line no-new
new CronJob(
  '0 * * * *',
  function () {
    rootController.updateCurrentPrice(spotCache)
  },
  null,
  true,
  timeZone
)

// at midnight
// eslint-disable-next-line no-new
new CronJob(
  '0 0 * * *',
  function () {
    resetPrices()
    rootController.updatePrices(spotCache)
    rootController.updateCurrentPrice(spotCache)
  },
  null,
  true,
  timeZone
)

storeController.initializeStoredFiles()
storeController.initializeCacheFromDisk(spotCache)
rootController.updatePrices(spotCache)
rootController.updateCurrentPrice(spotCache)
server.listen(port)
