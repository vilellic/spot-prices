var weightedPriceCalculator = require('./weightedPriceCalculator')
var constants = require("./constants");
var utils = require("./utils");
var dateUtils = require("./dateUtils");

module.exports = {

    getHours: function (spotCache, numberOfHours, startTime, endTime, highPrices, weightedPrices, offPeakTransferPrice, peakTransferPrice) {

        const cachedPrices = spotCache.get(constants.CACHED_NAME_PRICES)
        const cachedPricesYesterday = spotCache.get(constants.CACHED_NAME_YESTERDAY)
        const pricesFlat = [
            ...cachedPricesYesterday,
            ...cachedPrices.today,
            ...cachedPrices.tomorrow
        ]

        const startTimeDate = dateUtils.getDate(startTime)
        const endTimeDate = dateUtils.getDate(endTime)

        const timeFilteredPrices = pricesFlat.filter((entry) => entry.start >= startTimeDate && entry.start < endTimeDate)

        let useTransferPrices = false

        if (offPeakTransferPrice && peakTransferPrice) {
            useTransferPrices = true
            for (let f = 0; f < timeFilteredPrices.length; f++) {
                const hour = new Date(timeFilteredPrices[f].start).getHours()
                timeFilteredPrices[f].priceWithTransfer = Number(timeFilteredPrices[f].price) + ((hour >= 22 || hour < 7) ? offPeakTransferPrice : peakTransferPrice)
            }
        }

        let hoursArray = []

        if (weightedPrices) {

            hoursArray = weightedPriceCalculator.getWeightedPrices(numberOfHours, timeFilteredPrices)

        } else {
            timeFilteredPrices.sort((a, b) => {
                return useTransferPrices
                    ? (a.priceWithTransfer - b.priceWithTransfer)
                    : (a.price - b.price)
            })

            if (highPrices) {
                timeFilteredPrices.reverse()
            }

            hoursArray = timeFilteredPrices.slice(0, numberOfHours)

            dateUtils.sortByDate(hoursArray)
        }

        const onlyPrices = hoursArray.map((entry) => entry.price)
        const lowestPrice = Math.min(...onlyPrices)
        const highestPrice = Math.max(...onlyPrices)

        const hours = hoursArray.map((entry) => dateUtils.getWeekdayAndHourStr(entry.start))

        const currentHourDateStr = dateUtils.getWeekdayAndHourStr(new Date())
        const currentHourIsInList = hours.includes(currentHourDateStr)

        return {
            hours,
            info: {
                now: currentHourIsInList,
                min: lowestPrice,
                max: highestPrice,
                avg: Number(utils.getAveragePrice(hoursArray))
            }
        }
    }

}


