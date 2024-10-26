import { IncomingMessage, ServerResponse } from 'http';
import NodeCache from 'node-cache';

const http = require('http')
const server = http.createServer()
const moment = require('moment')
const CronJob = require('cron').CronJob

const utils = require("./utils/utils");
const rootController = require('./controller/rootController')
const queryController = require('./controller/queryController')
const linksController = require('./controller/linksController')
const storeController = require('./controller/storeController')

require('log-timestamp')(function () {
  return '[ ' + moment(new Date()).format('YYYY-MM-DD T HH:mm:ss ZZ') + ' ] %s'
})

require('console')

const protocol: string = 'http'
const port: number = 8089
const timeZone = 'Europe/Helsinki'

const spotCache : NodeCache = new NodeCache()

spotCache.on('set', function (key: string, value: object) {
  storeController.updateStoredResultWhenChanged(key, JSON.stringify(value))
})

server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  console.log('Request url = ' + `${protocol}://${req.headers.host}` + req.url)

  if (!utils.isCacheReady(spotCache)) {
    await rootController.updatePrices(spotCache)
  }

  if (req.url === '/') {
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

// at midnight
// eslint-disable-next-line no-new
new CronJob(
  '0 0 * * *',
  function () {
    storeController.resetPrices()
    rootController.updatePrices(spotCache)
  },
  null,
  true,
  timeZone
)

console.log('Spot Prices server starting ...')
storeController.initStoredFilesIfNotExists()
storeController.initCacheFromDisk(spotCache)
rootController.updatePrices(spotCache)
console.log('Ready!')
server.listen(port)
