const http = require('http')
const moment = require('moment')
const NodeCache = require('node-cache')

const server = http.createServer()

const vat = 1.24

const fetch = require('node-fetch')
const settings = { method: 'Get' }

const { readFileSync } = require('fs')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')

const cachedNameCurrent = 'current'
const cachedNamePrices = 'prices'

const CronJob = require('cron').CronJob

const spotCache = new NodeCache()

const updateTodayAndTomorrowPrices = async () => {
  let cachedPrices = spotCache.get(cachedNamePrices)

  if (cachedPrices === undefined) {
    cachedPrices = { today: [], tomorrow: [] }
  }

  const prices = {
    today: cachedPrices.today,
    tomorrow: cachedPrices.tomorrow
  }

  if (!isPriceListComplete(cachedPrices.today)) {
    prices.today = await updateDayPrices(getTodaySpanStart(), getTodaySpanEnd())
  }
  if (!isPriceListComplete(cachedPrices.tomorrow)) {
    prices.tomorrow = await updateDayPrices(getTomorrowSpanStart(), getTomorrowSpanEnd())
  }

  spotCache.set(cachedNamePrices, prices)
}

const updateCurrentPrice = async () => {
  const currentPrice = {}
  const json = await getCurrentJson()
  if (json.success === true) {
    currentPrice.price = getPrice(json.data[0].price)
    currentPrice.time = getDate(json.data[0].timestamp)
    spotCache.set(cachedNameCurrent, currentPrice)
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
      const priceRow = { start: getDate(pricesJson.data.fi[i].timestamp), price: getPrice(pricesJson.data.fi[i].price) }
      prices.push(priceRow)
    }
  }

  return prices
}

server.on('request', async (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })

  console.log('request url = ' + req.url)

  if (req.url === '/current') {
    // Current price
    let currentPrice = spotCache.get(cachedNameCurrent)
    if (currentPrice === undefined || Object.keys(currentPrice).length === 0) {
      await updateCurrentPrice()
      currentPrice = spotCache.get(cachedNameCurrent)
    }
    res.end(JSON.stringify(currentPrice))
  } else if (req.url === '/') {
    // Today and tomorrow prices
    let cachedPrices = spotCache.get(cachedNamePrices)
    if (cachedPrices === undefined || cachedPrices.length === 0) {
      await updateTodayAndTomorrowPrices()
      cachedPrices = spotCache.get(cachedNamePrices)
    }

    const prices = {
      info: {},
      ...cachedPrices
    }
    let currentPrice = getCurrentPriceFromTodayPrices(prices.today)
    if (currentPrice === undefined) {
      // Current price was not found for some reason. Fallback to call API to fetch price
      const currentJson = await getCurrentJson()
      currentPrice = getPrice(currentJson.data[0].price)
    }
    prices.info.current = currentPrice
    prices.info.tomorrowAvailable = isPriceListComplete(prices.tomorrow)

    prices.info.averageToday = getAveragePrice(prices.today)
    if (prices.info.tomorrowAvailable) {
      prices.info.averageTomorrow = getAveragePrice(prices.tomorrow)
    }

    res.end(JSON.stringify(prices))
  } else if (req.url.startsWith('/query')) {
    const parsed = new URL(req.url, `http://${req.headers.host}`)

    const numberOfHours = Number(parsed.searchParams.get('hours'))
    const startHour = Number(parsed.searchParams.get('startHour'))
    const endHour = Number(parsed.searchParams.get('endHour'))
    const highPrices = parsed.searchParams.get('highPrices')
    const offPeakTransferPrice = Number(parsed.searchParams.get('offPeakTransferPrice'))
    const peakTransferPrice = Number(parsed.searchParams.get('peakTransferPrice'))

    if (numberOfHours) {
      const hours = getHoursQuery(numberOfHours, startHour, endHour, highPrices, offPeakTransferPrice, peakTransferPrice)
      res.end(JSON.stringify(hours))
    } else {
      res.end(JSON.stringify({ lowestPrice: -1 }))
    }
  } else {
    res.statusCode = 404
    res.end('Not found')
  }
})

// http://localhost:8089/query?hours=6&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445

const getHoursQuery = (numberOfHours, startHour, endHour, highPrices, offPeakTransferPrice, peakTransferPrice) => {
  const cachedPrices = spotCache.get(cachedNamePrices)
  const pricesFlat = [
    ...cachedPrices.today,
    ...cachedPrices.tomorrow
  ]

  if (offPeakTransferPrice && peakTransferPrice) {
    for (let f = 0; f < pricesFlat.length; f++) {
      const hour = new Date(pricesFlat[f].start).getHours()
      pricesFlat[f].price = Number(pricesFlat[f].price) + ((hour >= 22 || hour <= 7) ? offPeakTransferPrice : peakTransferPrice)
    }
  }

  pricesFlat.sort((a, b) => {
    if (a.price > b.price) return 1
    else if (a.price < b.price) return -1
    else return 0
  })

  if (highPrices) {
    pricesFlat.reverse()
  }

  const slicedHours = pricesFlat.slice(0, numberOfHours)

  slicedHours.sort((a, b) => {
    if (a.start > b.start) return 1
    else if (a.start < b.start) return -1
    else return 0
  })

  const hours = slicedHours.map((entry) => getWeekdayAndHourStr(entry.start))

  const currentHourDateStr = getWeekdayAndHourStr(new Date())
  const currentHourIsInList = hours.includes(currentHourDateStr)

  return {
    hours,
    info: { now: currentHourIsInList }
  }
}

const isPriceListComplete = (priceList) => {
  return priceList !== undefined && priceList.length >= 23
}

async function getPricesJson (start, end) {
  const url = 'https://dashboard.elering.ee/api/nps/price?start=' + start + '&end=' + end
  const res = await fetch(url, settings)
  const json = await res.json()
  console.log(url)
  return json
}

async function getCurrentJson () {
  const url = 'https://dashboard.elering.ee/api/nps/price/FI/current'
  const res = await fetch(url, settings)
  const json = await res.json()
  console.log(url)
  return json
}

function writeToDisk (name, content) {
  try {
    writeFileSync(getStoredResultFileName(name), content, 'utf8')
    console.log('Updated result to disk = ' + name)
  } catch (error) {
    console.log('An error has occurred ', error)
  }
}

function readStoredResult (name) {
  const data = readFileSync(getStoredResultFileName(name))
  return JSON.parse(data)
}

function updateStoredResultWhenChanged (name, updatedResult) {
  const storedResult = JSON.stringify(readStoredResult(name))

  if (updatedResult !== storedResult) {
    writeToDisk(name, updatedResult)
  }
}

const getTodaySpanStart = () => {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

const getTodaySpanEnd = () => {
  const date = new Date()
  date.setHours(24, 0, 0, 0)
  date.setMilliseconds(date.getMilliseconds() - 1)
  return date.toISOString()
}

const getTomorrowSpanStart = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

const getTomorrowSpanEnd = () => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(24, 0, 0, 0)
  date.setMilliseconds(date.getMilliseconds() - 1)
  return date.toISOString()
}

function getDate (timestamp) {
  const timestampNumber = Number(timestamp * 1000)
  const momentDate = moment(new Date(timestampNumber))
  return momentDate.format('YYYY-MM-DDTHH:mm:ssZZ')
}

const getWeekdayAndHourStr = (date) => {
  return moment(date).format('ddd') + ' ' + new Date(date).getHours()
}

function getPrice (inputPrice) {
  return Number((Number(inputPrice) / 1000) * vat).toFixed(5)
}

const getCurrentPriceFromTodayPrices = (todayPrices) => {
  if (todayPrices === undefined) {
    return undefined
  }
  const currentHour = new Date().getHours()
  let currentPrice
  for (let h = 0; h < todayPrices.length; h++) {
    if (new Date(todayPrices[h].start).getHours() === currentHour) {
      currentPrice = todayPrices[h].price
    }
  }
  return currentPrice
}

const getAveragePrice = (pricesList) => {
  const prices = pricesList.map(row => Number(row.price))
  const sum = prices.reduce((acc, price) => acc + price, 0)
  const avg = sum / prices.length
  return Number((avg).toFixed(5)).toString()
}

function getStoredResultFileName (name) {
  return './' + name + '.json'
}

function initializeStoredFiles () {
  if (!existsSync(getStoredResultFileName(cachedNameCurrent)) || !existsSync(getStoredResultFileName(cachedNamePrices))) {
    resetStoredFiles()
    console.log('Stored files have been initialized')
  }
}

function resetStoredFiles () {
  writeToDisk(cachedNameCurrent, '{}')
  writeToDisk(cachedNamePrices, '[]')
}

function initializeCacheFromDisk () {
  if (!spotCache.has(cachedNameCurrent)) {
    spotCache.set(cachedNameCurrent, readStoredResult(cachedNameCurrent))
  }
  if (!spotCache.has(cachedNamePrices)) {
    spotCache.set(cachedNamePrices, readStoredResult(cachedNamePrices))
  }
}

function resetPrices () {
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
    updateTodayAndTomorrowPrices()
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
    updateTodayAndTomorrowPrices()
    updateCurrentPrice()
  },
  null,
  true,
  timeZone
)

initializeStoredFiles()
initializeCacheFromDisk()
updateTodayAndTomorrowPrices()
updateCurrentPrice()
server.listen(8089)
