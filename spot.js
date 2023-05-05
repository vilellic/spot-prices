const http = require('http');
const moment = require('moment');

const server = http.createServer();

const vat = 1.24

const fetch = require('node-fetch');
const settings = { method: "Get" };

const { readFileSync } = require('fs');
const { writeFileSync } = require('fs');

const cachedNameCurrent = 'current'
const cachedNamePrices = 'prices'

var cronJob = require("cron").CronJob;

const updateTodayAndTomorrowPrices = async () => {

    const cachedPrices = readCachedResult(cachedNamePrices)

    let prices = {
        "today" : cachedPrices.today,
        "tomorrow" : cachedPrices.tomorrow
    }
    if (!isPriceListComplete(cachedPrices.today)) {
        prices.today = await updateDayPrices(getTodaySpanStart(), getTodaySpanEnd())
    }
    if (!isPriceListComplete(cachedPrices.tomorrow)) {
        prices.tomorrow = await updateDayPrices(getTomorrowSpanStart(), getTomorrowSpanEnd())
    }

    updateCachedResultWhenChanged(cachedNamePrices, JSON.stringify(prices))

}

const updateCurrentPrice = async () => {
    const currentPrice = {}
    const json = await getCurrentJson();
    if (json.success == true) {
        currentPrice.price = getPrice(json.data[0].price)
        currentPrice.time = getDate(json.data[0].timestamp)
        updateCachedResultWhenChanged(cachedNameCurrent, JSON.stringify(currentPrice))
    }
}

const updateDayPrices = async (start, end) => {

    const prices = []

    const pricesJson = await getPricesJson(start, end)
    if (pricesJson.success == true) {
        for (var i = 0; i < pricesJson.data.fi.length; i++) {
            let priceRow = {start: getDate(pricesJson.data.fi[i].timestamp), price: getPrice(pricesJson.data.fi[i].price)}
            prices.push(priceRow)
        }
    }

    return prices

}

server.on('request', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'});

    if (req.url === '/current') {
        // Current price
        res.end(JSON.stringify(readCachedResult(cachedNameCurrent)))
    } else {
        // Today and tomorrow prices
        const prices = {
            "info" : {},
            ...readCachedResult(cachedNamePrices)
        }
        let currentPrice = getCurrentPriceFromTodayPrices(prices.today)
        if (currentPrice === undefined) {
            // Current price was not found for some reason. Fallback to call API to fetch price
            const currentJson = await getCurrentJson()
            currentPrice = getPrice(currentJson.data[0].price)
        }
        prices.info.current = currentPrice

        prices.info.tomorrowAvailable = isPriceListComplete(prices.tomorrow)
        res.end(JSON.stringify(prices))
    }

});

const isPriceListComplete = (priceList) => {
    return priceList !== undefined && priceList.length >= 23
}

async function getPricesJson(start, end) {
    const url = "https://dashboard.elering.ee/api/nps/price?start=" + start + "&end=" + end;
    const res = await fetch(url, settings)
    const json = await res.json()
    console.log(url)
    return json
}


async function getCurrentJson() {
    const url = "https://dashboard.elering.ee/api/nps/price/FI/current"
    const res = await fetch(url, settings)
    const json = await res.json()
    console.log(url)
    return json
}

function resetCacheFiles() {
    writeCachedResult(cachedNameCurrent, "{}")
    writeCachedResult(cachedNamePrices, "[]")
    console.log("Cache files have been reset")
}

function writeCachedResult(name, content) {
   try {
      writeFileSync('./' + name + '.json', content, 'utf8');
      console.log('Updated cached result to disk');
   } catch (error) {
      console.log('An error has occurred ', error);
   }
}

function readCachedResult(name) {
   const data = readFileSync('./' + name + '.json');
   return JSON.parse(data);
}

function updateCachedResultWhenChanged(name, updatedResult) {
   const cachedResult = JSON.stringify(readCachedResult(name))

   if (updatedResult !== cachedResult) {
      writeCachedResult(name, updatedResult)
   }

}

const getTodaySpanStart = () => {
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    return date.toISOString()
}

const getTodaySpanEnd = () => {
    let date = new Date()
    date.setHours(24, 0, 0, 0)
    date.setMilliseconds(date.getMilliseconds() - 1)
    return date.toISOString()
}

const getTomorrowSpanStart = () => {
    let date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(0, 0, 0, 0)
    return date.toISOString()
}

const getTomorrowSpanEnd = () => {
    let date = new Date()
    date.setDate(date.getDate() + 1)
    date.setHours(24, 0, 0, 0)
    date.setMilliseconds(date.getMilliseconds() - 1)
    return date.toISOString()
}

function getDate(timestamp) {
    let timestampNumber = Number(timestamp * 1000)
    var momentDate = moment(new Date(timestampNumber));
    return momentDate.format("YYYY-MM-DDTHH:mm:ssZZ");
}

function getPrice(inputPrice) {
    return Number((Number(inputPrice) / 1000) * vat).toFixed(5)
}

const getCurrentPriceFromTodayPrices = (todayPrices) => {
    if (todayPrices === undefined) {
        return undefined
    }
    const currentHour = new Date().getHours()
    let currentPrice = undefined
    for (h = 0; h < todayPrices.length; h++) {
        if (new Date(todayPrices[h].start).getHours() === currentHour) {
            currentPrice = todayPrices[h].price
        }
    }
    return currentPrice
}

// Server startup

// Run every minute
new cronJob("* * * * *", async function() {
    updateTodayAndTomorrowPrices()
}, null, true);

// Run every hour
new cronJob("0 * * * *", async function() {
    updateCurrentPrice()
}, null, true);

// Run at every midnight
new cronJob("0 0 * * *", async function() {
    resetCacheFiles()
}, null, true);

resetCacheFiles()
updateTodayAndTomorrowPrices()
updateCurrentPrice()

server.listen(8089);
