import { IncomingMessage, ServerResponse } from 'http';
import { DateRange, SpotPrices, TransferPrices } from './types/types';

const { readFileSync } = require('fs')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')

const http = require('http')
const server = http.createServer()
const moment = require('moment')
const NodeCache = require('node-cache')
const CronJob = require('cron').CronJob

var constants = require("./types/constants");
var utils = require("./utils/utils");
var dateUtils = require("./utils/dateUtils");
var query = require('./services/query')
var links = require('./services/links')
var rootController = require('./controller/rootController')

require('log-timestamp')(function () {
  return '[ ' + moment(new Date()).format('YYYY-MM-DD T HH:mm:ss ZZ') + ' ] %s'
})

require('console')

const protocol: string = 'http'
const port: number = 8089

const spotCache = new NodeCache()

spotCache.on('set', function (key: string, value: Object) {
  updateStoredResultWhenChanged(key, JSON.stringify(value))
})

server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  console.log('Request url = ' + `${protocol}://${req.headers.host}` + req.url)

  if (req.url === '/current') {
    rootController.handleCurrent({res: res, cache: spotCache})
  } else if (req.url === '/') {
    rootController.handleRoot({res: res, cache: spotCache})
  } else if (req.url?.startsWith('/query')) {
    const prices = spotCache.get(constants.CACHED_NAME_PRICES)
    if (prices == undefined || prices.length == 0) {
      res.end(getUnavailableResponse())
      return
    }

    const parsed = new URL(req.url, `${protocol}://${req.headers.host}`)

    const numberOfHours = Number(parsed.searchParams.get('hours'))
    const startTime = Number(parsed.searchParams.get('startTime'))
    const endTime = Number(parsed.searchParams.get('endTime'))
    const queryMode: string = parsed.searchParams.get('queryMode') || 'LowestPrices'
    const offPeakTransferPrice = Number(parsed.searchParams.get('offPeakTransferPrice'))
    const peakTransferPrice = Number(parsed.searchParams.get('peakTransferPrice'))
    const transferPrices: TransferPrices | undefined = offPeakTransferPrice && peakTransferPrice ? {
      offPeakTransfer: offPeakTransferPrice,
      peakTransfer: peakTransferPrice
    } : undefined

    const dateRange : DateRange = {
      start: dateUtils.getDate(startTime),
      end: dateUtils.getDate(endTime),
    }

    if (queryMode !== 'AboveAveragePrices' && !numberOfHours) {
      res.end(getUnavailableResponse())
      return
    } else {
      const hours = query.getHours({spotPrices: prices, numberOfHours: numberOfHours, 
        dateRange: dateRange, queryMode: queryMode, transferPrices})
      if (hours) {
        res.end(JSON.stringify(hours))
        return
      } else {
        res.end(getUnavailableResponse())
        return
      }  
    }

  } else if (req.url?.startsWith('/links')) {

    const parsed = new URL(req.url, `${protocol}://${req.headers.host}`)
    const numberOfHours = Number(parsed.searchParams.get('hours'))
    let cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES) as SpotPrices
    if (cachedPrices === undefined) {
      res.end('Not available')
      return
    }
    const tomorrowAvailable = utils.isPriceListComplete(cachedPrices.tomorrow)
    const offPeakTransferPrice = Number(parsed.searchParams.get('offPeakTransferPrice'))
    const peakTransferPrice = Number(parsed.searchParams.get('peakTransferPrice'))
    const transferPrices: TransferPrices | undefined = offPeakTransferPrice && peakTransferPrice ? {
      offPeakTransfer: offPeakTransferPrice,
      peakTransfer: peakTransferPrice
    } : undefined
    res.end(JSON.stringify(links.getExampleLinks({host: `${protocol}://${req.headers.host}`, 
      tomorrowAvailable: tomorrowAvailable, noHours: numberOfHours, transferPrices: transferPrices})))

  } else {
    res.statusCode = 404
    res.end('Not found')
  }
})

const getUnavailableResponse = () => {
  return JSON.stringify({ hours: [] })
}

function writeToDisk(name: string, content: string) {
  try {
    writeFileSync(getStoredResultFileName(name), content, 'utf8')
    console.log('Updated result to disk = ' + name)
  } catch (error) {
    console.log('An error has occurred ', error)
  }
}

function readStoredResult(name: string) {
  const data = readFileSync(getStoredResultFileName(name))
  return JSON.parse(data)
}

function updateStoredResultWhenChanged(name: string, updatedResult: string) {
  const storedResult = JSON.stringify(readStoredResult(name))

  if (updatedResult !== storedResult) {
    writeToDisk(name, updatedResult)
  }
}

function getStoredResultFileName(name: string) {
  return './' + name + '.json'
}

function initializeStoredFiles() {
  if (!existsSync(getStoredResultFileName(constants.CACHED_NAME_CURRENT)) ||
    !existsSync(getStoredResultFileName(constants.CACHED_NAME_PRICES))) {
    resetStoredFiles()
    console.log('Stored files have been initialized')
  }
}

function resetStoredFiles() {
  writeToDisk(constants.CACHED_NAME_CURRENT, '{}')
  writeToDisk(constants.CACHED_NAME_PRICES, '[]')
}

function initializeCacheFromDisk() {
  if (!spotCache.has(constants.CACHED_NAME_CURRENT)) {
    spotCache.set(constants.CACHED_NAME_CURRENT, readStoredResult(constants.CACHED_NAME_CURRENT))
  }
  if (!spotCache.has(constants.CACHED_NAME_PRICES)) {
    spotCache.set(constants.CACHED_NAME_PRICES, readStoredResult(constants.CACHED_NAME_PRICES))
  }
}

function resetPrices() {
  resetStoredFiles()
  console.log(spotCache.getStats())
  spotCache.flushAll()
  console.log('Cache has been flushed')
}

// Server startup

const timeZone = 'Europe/Helsinki'

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

initializeStoredFiles()
initializeCacheFromDisk()
rootController.updatePrices(spotCache)
rootController.updateCurrentPrice(spotCache)
server.listen(port)
