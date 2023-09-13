import { HoursContainer, PriceRow, PriceRowWithTransfer, SpotPrices, TransferPrices } from "../types/types";

var weightedPriceCalculator = require('./weightedPriceCalculator')
var utils = require("../utils/utils");
var dateUtils = require("../utils/dateUtils");

module.exports = {

  getHours: function (cachedPrices: SpotPrices, numberOfHours: number, startTime: string, endTime: string, 
    highPrices: boolean, weightedPrices: boolean, transferPrices?: TransferPrices) : HoursContainer {

    const pricesFlat = [
      ...cachedPrices.yesterday,
      ...cachedPrices.today,
      ...cachedPrices.tomorrow
    ] as PriceRowWithTransfer[]

    const startTimeDate: Date = dateUtils.getDate(startTime)
    const endTimeDate: Date = dateUtils.getDate(endTime)

    const timeFilteredPrices: PriceRowWithTransfer[] = pricesFlat.filter((entry) => entry.start >= startTimeDate && entry.start < endTimeDate)

    if (transferPrices !== undefined) {
      for (let f = 0; f < timeFilteredPrices.length; f++) {
        const hour = new Date(timeFilteredPrices[f].start).getHours()
        timeFilteredPrices[f].priceWithTransfer = Number(timeFilteredPrices[f].price) + ((hour >= 22 || hour < 7) ? 
          transferPrices.offPeakTransfer : transferPrices.peakTransfer)
      }
    }

    let resultArray: PriceRowWithTransfer[] = []

    if (weightedPrices) {

      resultArray = weightedPriceCalculator.getWeightedPrices(numberOfHours, timeFilteredPrices, transferPrices !== undefined)

    } else {
      timeFilteredPrices.sort((a, b) => {
        return transferPrices !== undefined
          ? (a.priceWithTransfer - b.priceWithTransfer)
          : (a.price - b.price)
      })

      if (highPrices) {
        timeFilteredPrices.reverse()
      }

      resultArray = timeFilteredPrices.slice(0, numberOfHours)

      dateUtils.sortByDate(resultArray)
    }

    const onlyPrices = resultArray.map((entry: PriceRow) => entry.price)
    const lowestPrice = Math.min(...onlyPrices)
    const highestPrice = Math.max(...onlyPrices)

    const hours = resultArray.map((entry: PriceRow) => dateUtils.getWeekdayAndHourStr(entry.start))

    const currentHourDateStr = dateUtils.getWeekdayAndHourStr(new Date())
    const currentHourIsInList = hours.includes(currentHourDateStr)

    return {
      hours,
      info: {
        now: currentHourIsInList,
        min: lowestPrice,
        max: highestPrice,
        avg: Number(utils.getAveragePrice(resultArray))
      }
    }
  }

}


