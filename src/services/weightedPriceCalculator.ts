import { PriceRow, PriceRowWithTransfer } from "../types/types";

var dateUtils = require("../utils/dateUtils");

module.exports = {

  getWeightedPrices: function (numberOfHours: number, 
    timeFilteredPrices: PriceRowWithTransfer[], useTransferPrices: boolean) {

    const hoursArray = [] as PriceRowWithTransfer[]

    const weightArray = [] as number[]
    const weightDivider = 10 / numberOfHours
    let index = 0
    for (let i = 10; i > weightDivider; i = i - weightDivider) {
      weightArray[index] = i
      index++
    }
    if (weightArray.length === numberOfHours - 1) {
      weightArray.push(weightDivider)
    }

    const lastTestIndex = timeFilteredPrices.length - numberOfHours
    const weightedResults = []
    for (let t = 0; t < timeFilteredPrices.length; t++) {
      if (t > lastTestIndex) {
        break
      } else {
        weightedResults[t] = {
          start: timeFilteredPrices[t].start,
          weightedResult: calculateWeightedResult(weightArray, numberOfHours, timeFilteredPrices, t, useTransferPrices)
        }
      }
    }

    const minWeightedResult = weightedResults.reduce((min, w) => w.weightedResult < min.weightedResult ? w : min, weightedResults[0])

    if (minWeightedResult !== undefined) {
      const indexOfWeightedResultFirstHour = dateUtils.findIndexWithDate(timeFilteredPrices, minWeightedResult.start)
      let runningIndex = indexOfWeightedResultFirstHour
      for (let a = 0; a < numberOfHours; a++) {
        hoursArray.push(timeFilteredPrices[runningIndex++])
      }
    }

    return hoursArray

  }

};

const calculateWeightedResult = (weightArray: number[], numberOfHours: number, 
  timeFilteredPrices: PriceRowWithTransfer[], index: number, useTransferPrices: boolean) => {
  let result = 0
  for (let i = 0; i < numberOfHours; i++) {
    const price = useTransferPrices ? timeFilteredPrices[index + i].priceWithTransfer : timeFilteredPrices[index + i].price
    result += price * weightArray[i]
  }
  return result
}