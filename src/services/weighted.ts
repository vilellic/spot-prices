import { PriceRowWithTransfer } from "../types/types";
import { QueryMode } from "./query";

var dateUtils = require("../utils/dateUtils");

interface WeightedPricesParameters {
  numberOfHours: number,
  priceList: PriceRowWithTransfer[],
  useTransferPrices: boolean,
  queryMode: QueryMode,
}

module.exports = {

  getWeightedPrices: function ({numberOfHours, priceList, 
    useTransferPrices, queryMode} : WeightedPricesParameters) : PriceRowWithTransfer[] {

    const weightArray = [] as number[]
    if (queryMode === QueryMode.WeightedPrices) {
      const weightDivider = 10 / numberOfHours
      let index = 0
      for (let i = 10; i > weightDivider; i = i - weightDivider) {
        weightArray[index] = i
        index++
      }
      if (weightArray.length === numberOfHours - 1) {
        weightArray.push(weightDivider)
      }
    } else if (queryMode === QueryMode.SequentialPrices) {
      for (let w = 0; w < numberOfHours - 1; w++) {
        weightArray.push(2)
      }
      weightArray.push(1.75)
    }

    const lastTestIndex = priceList.length - numberOfHours
    const weightedResults = []
    for (let t = 0; t < priceList.length; t++) {
      if (t > lastTestIndex) {
        break
      } else {
        weightedResults[t] = {
          start: priceList[t].start,
          weightedResult: calculateWeightedSum(weightArray, numberOfHours, priceList, t, useTransferPrices)
        }
      }
    }

    const minWeightedResult = weightedResults.reduce((min, w) => w.weightedResult < min.weightedResult ? w : min, weightedResults[0])
    const hoursArray = [] as PriceRowWithTransfer[]

    if (minWeightedResult !== undefined) {
      const indexOfWeightedResultFirstHour = dateUtils.findIndexWithDate(priceList, minWeightedResult.start)
      let runningIndex = indexOfWeightedResultFirstHour
      for (let a = 0; a < numberOfHours; a++) {
        hoursArray.push(priceList[runningIndex++])
      }
    }

    return hoursArray

  }

};

const calculateWeightedSum = (weightArray: number[], numberOfHours: number, 
  priceList: PriceRowWithTransfer[], index: number, useTransferPrices: boolean) : number => {
  let result = 0
  for (let i = 0; i < numberOfHours; i++) {
    const price = useTransferPrices ? priceList[index + i].priceWithTransfer : priceList[index + i].price
    result += price * weightArray[i]
  }
  return result
}