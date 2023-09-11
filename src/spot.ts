const http = require('http')
const moment = require('moment')
const NodeCache = require('node-cache')

const server = http.createServer()

import fetch from 'node-fetch';
const settings = { method: 'Get' }

const { readFileSync } = require('fs')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')

require('log-timestamp')(function () {
  return '[ ' + moment(new Date()).format('YYYY-MM-DD T HH:mm:ss ZZ') + ' ] %s'
})

require('console')

var constants = require("./constants");
var utils = require("./utils");
var dateUtils = require("./dateUtils");
var queryProcessor = require('./queryProcessor')

const CronJob = require('cron').CronJob

const spotCache = new NodeCache()

const updatePrices = async () => {
  let cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES)

  if (cachedPrices === undefined) {
    cachedPrices = {
      yesterday: [],
      today: [],
      tomorrow: []
    }
  }

  const prices = {
    today: cachedPrices.today,
    tomorrow: cachedPrices.tomorrow,
    yesterday: cachedPrices.yesterday
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

spotCache.on('set', function (key, value) {
  updateStoredResultWhenChanged(key, JSON.stringify(value))
})

const updateDayPrices = async (start, end) => {
  const prices = []

  const pricesJson = await getPricesJson(start, end)
  if (pricesJson.success === true) {
    for (let i = 0; i < pricesJson.data.fi.length; i++) {
      const priceRow = {
        start: dateUtils.getDate(pricesJson.data.fi[i].timestamp),
        price: utils.getPrice(pricesJson.data.fi[i].price)
      }
      prices.push(priceRow)
    }
  }

  return prices
}

interface PriceRow {
  start: Date,
  price: Number,
}

interface PricesContainer {
  info: {
    current: Number,
    tomorrowAvailable2: boolean,
  }
  today: PriceRow[]
  tomorrow: PriceRow[]
}

server.on('request', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  console.log('Request url, nauris = ' + `http://${req.headers.host}` + req.url)

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
    let cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES)
    if (cachedPrices === undefined || cachedPrices.length === 0) {
      await updatePrices()
      cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES)
    }

    let currentPrice = utils.getCurrentPriceFromTodayPrices(cachedPrices.today)
    if (currentPrice === undefined) {
      // Current price was not found for some reason. Fallback to call API to fetch price
      const currentJson = await getCurrentJson()
      currentPrice = utils.getPrice(currentJson.data[0].price)
    }

    /*
    prices.info.averageToday = utils.getAveragePrice(prices.today)
    if (prices.info.tomorrowAvailable) {
      prices.info.averageTomorrow = utils.getAveragePrice(prices.tomorrow)
    }
    */

    const prices: PricesContainer = {
      info: {
        current: currentPrice,
        tomorrowAvailable2: isPriceListComplete(cachedPrices.tomorrow),
      },
      today: cachedPrices.today,
      tomorrow: cachedPrices.tomorrow
    }

    res.end(JSON.stringify(prices))
  } else if (req.url.startsWith('/query')) {
    const parsed = new URL(req.url, `http://${req.headers.host}`)

    const numberOfHours = Number(parsed.searchParams.get('hours'))
    const startTime = Number(parsed.searchParams.get('startTime'))
    const endTime = Number(parsed.searchParams.get('endTime'))
    const highPrices = parsed.searchParams.get('highPrices')
    const weightedPrices = parsed.searchParams.get('weightedPrices')
    const offPeakTransferPrice = Number(parsed.searchParams.get('offPeakTransferPrice'))
    const peakTransferPrice = Number(parsed.searchParams.get('peakTransferPrice'))

    if (numberOfHours) {
      const hours = queryProcessor.getHours(spotCache, numberOfHours, startTime, endTime,
        highPrices, weightedPrices, offPeakTransferPrice, peakTransferPrice)
      res.end(JSON.stringify(hours))
    } else {
      res.end(JSON.stringify({ hours: 'unavailable' }))
    }
  } else {
    res.statusCode = 404
    res.end('Not found')
  }
})

const isPriceListComplete = (priceList) => {
  return priceList !== undefined && priceList.length >= 23
}

async function getPricesJson(start, end) {
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

function writeToDisk(name, content) {
  try {
    writeFileSync(getStoredResultFileName(name), content, 'utf8')
    console.log('Updated result to disk = ' + name)
  } catch (error) {
    console.log('An error has occurred ', error)
  }
}

function readStoredResult(name) {
  const data = readFileSync(getStoredResultFileName(name))
  return JSON.parse(data)
}

function updateStoredResultWhenChanged(name, updatedResult) {
  const storedResult = JSON.stringify(readStoredResult(name))

  if (updatedResult !== storedResult) {
    writeToDisk(name, updatedResult)
  }
}

function getStoredResultFileName(name) {
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
