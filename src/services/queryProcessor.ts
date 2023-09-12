import NodeCache from "node-cache";
import { PriceRow, PriceRowWithTransfer, SpotPrices } from "../types/types";

var weightedPriceCalculator = require('./weightedPriceCalculator')
var constants = require("../types/constants");
var utils = require("../utils/utils");
var dateUtils = require("../utils/dateUtils");

module.exports = {

  getHours: function (cachedPrices: SpotPrices, numberOfHours: number, startTime: string, endTime: string, 
    highPrices: boolean, weightedPrices: boolean, offPeakTransferPrice: number, peakTransferPrice: number) {

    const pricesFlat = [
      ...cachedPrices.yesterday,
      ...cachedPrices.today,
      ...cachedPrices.tomorrow
    ] as PriceRowWithTransfer[]

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

      hoursArray = weightedPriceCalculator.getWeightedPrices(numberOfHours, timeFilteredPrices, useTransferPrices)

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

    const onlyPrices = hoursArray.map((entry: PriceRow) => entry.price)
    const lowestPrice = Math.min(...onlyPrices)
    const highestPrice = Math.max(...onlyPrices)

    const hours = hoursArray.map((entry: PriceRow) => dateUtils.getWeekdayAndHourStr(entry.start))

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


