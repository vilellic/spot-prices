import { DateRange, HoursContainer, PriceRow, PriceRowWithTransfer, SpotPrices, TransferPrices } from "../types/types";

var weighted = require('./weighted')
var utils = require("../utils/utils");
var dateUtils = require("../utils/dateUtils");

interface GetHoursParameters {
  spotPrices: SpotPrices,
  numberOfHours: number,
  dateRange: DateRange,
  queryMode: QueryMode,
  transferPrices?: TransferPrices
}

export enum QueryMode {
  LowestPrices = "LowestPrices",
  HighestPrices = "HighestPrices",
  OverAveragePrices = "OverAveragePrices",
  WeightedPrices = "WeightedPrices",
  SequentialPrices = "SequentialPrices"
}

module.exports = {

  getHours: function ({ spotPrices, numberOfHours, dateRange,
    queryMode, transferPrices }: GetHoursParameters): HoursContainer | undefined {

    // Validate queryMode parameter
    if (![QueryMode.LowestPrices, QueryMode.HighestPrices, QueryMode.OverAveragePrices,
    QueryMode.WeightedPrices, QueryMode.SequentialPrices].includes(queryMode)) {
      return undefined
    }

    if (queryMode !== QueryMode.OverAveragePrices && numberOfHours === undefined) {
      return undefined
    }

    const pricesFlat = [
      ...spotPrices.yesterday,
      ...spotPrices.today,
      ...spotPrices.tomorrow
    ] as PriceRowWithTransfer[]

    const timeFilteredPrices: PriceRowWithTransfer[] = pricesFlat.filter((entry) =>
      dateUtils.parseISODate(entry.start) >= dateRange.start && dateUtils.parseISODate(entry.start) < dateRange.end)

    if (transferPrices !== undefined) {
      for (let f = 0; f < timeFilteredPrices.length; f++) {
        const hour = new Date(timeFilteredPrices[f].start).getHours()
        timeFilteredPrices[f].priceWithTransfer = Number(timeFilteredPrices[f].price) + ((hour >= 22 || hour < 7) ?
          transferPrices.offPeakTransfer : transferPrices.peakTransfer)
      }
    }

    let resultArray: PriceRowWithTransfer[] = []

    if ([QueryMode.WeightedPrices, QueryMode.SequentialPrices].includes(queryMode)) {

      resultArray = weighted.getWeightedPrices({
        numberOfHours: numberOfHours,
        priceList: timeFilteredPrices, useTransferPrices: transferPrices !== undefined, queryMode: queryMode
      })

    } else {

      if (queryMode === QueryMode.OverAveragePrices) {

        const avgPriceAll = transferPrices === undefined ? 
          Number(utils.getAveragePrice(timeFilteredPrices)) : Number(utils.getAveragePriceWithTransfer(timeFilteredPrices))
        resultArray = timeFilteredPrices.filter((row: PriceRowWithTransfer) => {
          return transferPrices === undefined ? (row.price > avgPriceAll) : (row.priceWithTransfer > avgPriceAll)
        })

      } else {
        // LowestPrices / HighestPrices
        timeFilteredPrices.sort((a, b) => {
          return transferPrices !== undefined
            ? (a.priceWithTransfer - b.priceWithTransfer)
            : (a.price - b.price)
        })

        if (queryMode === QueryMode.HighestPrices) {
          timeFilteredPrices.reverse()
        }

        resultArray = timeFilteredPrices.slice(0, numberOfHours)
        dateUtils.sortByDate(resultArray)
      }
    }

    const onlyPrices = resultArray.map((entry: PriceRow) => entry.price)
    const lowestPrice = Math.min(...onlyPrices)
    const highestPrice = Math.max(...onlyPrices)

    const hoursSet = new Set(resultArray.map((entry: PriceRow) => dateUtils.getWeekdayAndHourStr(entry.start)))
    const hours = [...hoursSet]

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


