const http = require('http')
import { IncomingMessage, ServerResponse } from 'http';
const moment = require('moment')
const NodeCache = require('node-cache')

const server = http.createServer()

import fetch from 'node-fetch';
import { DateRange, PriceRow, PricesContainer, SpotPrices, TransferPrices } from './types/types';
const settings = { method: 'Get' }

const { readFileSync } = require('fs')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')

require('log-timestamp')(function () {
  return '[ ' + moment(new Date()).format('YYYY-MM-DD T HH:mm:ss ZZ') + ' ] %s'
})

require('console')

var constants = require("./types/constants");
var utils = require("./utils/utils");
var dateUtils = require("./utils/dateUtils");
var query = require('./services/query')

const CronJob = require('cron').CronJob

const spotCache = new NodeCache()

const updatePrices = async () => {
  let cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES) as SpotPrices

  let prices = {} as SpotPrices
  if (cachedPrices === undefined) {
    cachedPrices = {
      yesterday: [],
      today: [],
      tomorrow: []
    } as SpotPrices
  } else {
    prices = {
      today: cachedPrices.today,
      tomorrow: cachedPrices.tomorrow,
      yesterday: cachedPrices.yesterday
    }
  }

  if (!isPriceListComplete(cachedPrices.today)) {
    prices.today = await updateDayPrices(dateUtils.getTodaySpanStart(), dateUtils.getTodaySpanEnd())
  }
  if (!isPriceListComplete(cachedPrices.tomorrow)) {
    prices.tomorrow = await updateDayPrices(dateUtils.getTomorrowSpanStart(), dateUtils.getTomorrowSpanEnd())
  }
  if (!isPriceListComplete(cachedPrices.yesterday)) {
    prices.yesterday = await updateDayPrices(dateUtils.getYesterdaySpanStart(), dateUtils.getYesterdaySpanEnd())
  }

  spotCache.set(constants.CACHED_NAME_PRICES, prices)
}

const updateCurrentPrice = async () => {
  const currentPrice = {
    price: Number,
    time: Date,
  }
  const json = await getCurrentJson()
  if (json.success === true) {
    currentPrice.price = utils.getPrice(json.data[0].price)
    currentPrice.time = dateUtils.getDate(json.data[0].timestamp)
    spotCache.set(constants.CACHED_NAME_CURRENT, currentPrice)
  }
}

spotCache.on('set', function (key: string, value: Object) {
  updateStoredResultWhenChanged(key, JSON.stringify(value))
})

const updateDayPrices = async (start: string, end: string) => {
  const prices = []

  const pricesJson = await getPricesJson(start, end)
  if (pricesJson.success === true) {
    for (let i = 0; i < pricesJson.data.fi.length; i++) {
      const priceRow : PriceRow = {
        start: dateUtils.getDateStr(pricesJson.data.fi[i].timestamp),
        price: utils.getPrice(pricesJson.data.fi[i].price)
      }
      prices.push(priceRow)
    }
  }

  return prices
}

server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  console.log('Request url = ' + `http://${req.headers.host}` + req.url)

  if (req.url === '/current') {
    // Current price
    let currentPrice = spotCache.get(constants.CACHED_NAME_CURRENT)
    if (currentPrice === undefined || Object.keys(currentPrice).length === 0) {
      await updateCurrentPrice()
      currentPrice = spotCache.get(constants.CACHED_NAME_CURRENT)
    }
    res.end(JSON.stringify(currentPrice))
  } else if (req.url === '/') {
    // Today and tomorrow prices
    let cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES) as SpotPrices
    if (cachedPrices === undefined || cachedPrices.today.length === 0) {
      await updatePrices()
      cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES)
    }

    let currentPrice = utils.getCurrentPriceFromTodayPrices(cachedPrices.today)
    if (currentPrice === undefined) {
      // Current price was not found for some reason. Fallback to call API to fetch price
      const currentJson = await getCurrentJson()
      currentPrice = utils.getPrice(currentJson.data[0].price)
    }

    const tomorrowAvailable = isPriceListComplete(cachedPrices.tomorrow)
    const avgTomorrowArray = tomorrowAvailable ? { averageTomorrow: utils.getAveragePrice(cachedPrices.tomorrow) } : []

    const prices: PricesContainer = {
      info: {
        current: currentPrice,
        averageToday: utils.getAveragePrice(cachedPrices.today),
        ...avgTomorrowArray,
        tomorrowAvailable: tomorrowAvailable,
      },
      today: cachedPrices.today,
      tomorrow: cachedPrices.tomorrow
    }

    res.end(JSON.stringify(prices))
  } else if (req.url?.startsWith('/query')) {
    const parsed = new URL(req.url, `http://${req.headers.host}`)

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

    if (queryMode !== 'OverAveragePrices' && !numberOfHours) {
      res.end(getUnavailableResponse())
    } else {
      const spotPrices = spotCache.get(constants.CACHED_NAME_PRICES) as SpotPrices
      const hours = query.getHours({spotPrices: spotPrices, numberOfHours: numberOfHours, 
        dateRange: dateRange, queryMode: queryMode, transferPrices})
      if (hours) {
        res.end(JSON.stringify(hours))
      } else {
        res.end(getUnavailableResponse())
      }  
    }

  } else {
    res.statusCode = 404
    res.end('Not found')
  }
})

const getUnavailableResponse = () => {
  return JSON.stringify({ hours: 'unavailable' })
}

const isPriceListComplete = (priceList: PriceRow[]) => {
  return priceList !== undefined && priceList.length >= 23
}

async function getPricesJson(start: string, end: string) {
  const url = 'https://dashboard.elering.ee/api/nps/price?start=' + start + '&end=' + end
  const res = await fetch(url, settings)
  const json = await res.json()
  console.log(url)
  return json
}

async function getCurrentJson() {
  const url = 'https://dashboard.elering.ee/api/nps/price/FI/current'
  const res = await fetch(url, settings)
  const json = await res.json()
  console.log(url)
  return json
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
    updatePrices()
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
    updateCurrentPrice()
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
    updatePrices()
    updateCurrentPrice()
  },
  null,
  true,
  timeZone
)

initializeStoredFiles()
initializeCacheFromDisk()
updatePrices()
updateCurrentPrice()
server.listen(8089)
