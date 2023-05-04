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

const returnCachedResult = (res, name) => {
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(readCachedResult(name)))
}

server.on('request', async (req, res) => {

    if (req.url === '/current') {

        try {
            let currentPrice = {}
            const json = await getCurrentJson();
            if (json.success == true) {
                res.writeHead(200, {'Content-Type': 'application/json'});
                console.log(JSON.stringify(json))
                currentPrice.price = getPrice(json.data[0].price)
                currentPrice.time = getDate(json.data[0].timestamp)
                res.end(JSON.stringify(currentPrice));
                updateCachedResultWhenChanged(cachedNameCurrent, JSON.stringify(currentPrice))
            } else {
                returnCachedResult(res, cachedNameCurrent)
            }
        } catch (error) {
            console.error("Error while fetching current price. Error = " + error)
            returnCachedResult(res, cachedNameCurrent)        
        }

    } else {

        try {

            let prices = {
                "info" : {},
                "today" : [],
                "tomorrow" : []
            }
    
            const start = getTodaySpanStart()
            const end = getTodaySpanEnd()
    
            const todayJson = await getPricesJson(start, end)
    
            if (todayJson.success == true) {
                const currentJson = await getCurrentJson()
                if (currentJson.success) {
                    prices.info.current = getPrice(currentJson.data[0].price)
                }
    
                for (var i = 0; i < todayJson.data.fi.length; i++) {
                    let priceRow = {start: getDate(todayJson.data.fi[i].timestamp), price: getPrice(todayJson.data.fi[i].price)}
                    prices.today.push(priceRow)
                }
    
                let tomorrowAvailable = false
                const tomorrowJson = await getPricesJson(getTomorrowSpanStart(), getTomorrowSpanEnd())
                if (tomorrowJson.success == true) {
                    tomorrowAvailable = tomorrowJson.data.fi.length >= 23
                    for (var i = 0; i < tomorrowJson.data.fi.length; i++) {
                        let priceRow = {start: getDate(tomorrowJson.data.fi[i].timestamp), price: getPrice(tomorrowJson.data.fi[i].price)}
                        prices.tomorrow.push(priceRow)
                    }
                }
                prices.info.tomorrowAvailable = tomorrowAvailable
    
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify(prices))
                updateCachedResultWhenChanged(cachedNamePrices, JSON.stringify(prices))
            } else {
                returnCachedResult(res, cachedNamePrices)        
            }

        } catch (error) {
            console.error("Error while fetching prices. Error = " + error)
            returnCachedResult(res, cachedNamePrices)        
        }

    }

});

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
    return json
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


server.listen(8089);
