import { DateRange, LinksContainer, TransferPrices } from "../types/types";

var dateUtils = require("../utils/dateUtils");

export interface GetExampleLinksPars {
  host: string
}

const yesterday21: Date = dateUtils.getDateFromHourStarting(new Date(), -1, 21)
const today21: Date = dateUtils.getDateFromHourStarting(new Date(), 0, 21)
const tomorrow21: Date = dateUtils.getDateFromHourStarting(new Date(), 1, 21) 

module.exports = {

  getExampleLinks: function ({ host }: GetExampleLinksPars): LinksContainer {

    const amountOfHours: number = 6;

    const dateRangeToday : DateRange = {
      start: yesterday21,
      end: today21,
    }

    const dateRangeTomorrow : DateRange = {
      start: today21,
      end: tomorrow21,
    }

    const transferPrices: TransferPrices = {
      peakTransfer: 0.0445,
      offPeakTransfer: 0.0274
    }

    return { 
      today: {
       "LowestPrices": host + createUrl("LowestPrices", amountOfHours, dateRangeToday, transferPrices),
       "HighestPrices": host + createUrl("HighestPrices", amountOfHours, dateRangeToday, transferPrices),
       "OverAveragePrices": host + createUrl("OverAveragePrices", amountOfHours, dateRangeToday, transferPrices),
       "WeightedPrices": host + createUrl("WeightedPrices", amountOfHours, dateRangeToday, transferPrices),
       "SequentialPrices": host + createUrl("SequentialPrices", amountOfHours, dateRangeToday, transferPrices)
      },
      tomorrow: {
        "LowestPrices": host + createUrl("LowestPrices", amountOfHours, dateRangeTomorrow, transferPrices),
        "HighestPrices": host + createUrl("HighestPrices", amountOfHours, dateRangeTomorrow, transferPrices),
        "OverAveragePrices": host + createUrl("OverAveragePrices", amountOfHours, dateRangeTomorrow, transferPrices),
        "WeightedPrices": host + createUrl("WeightedPrices", amountOfHours, dateRangeTomorrow, transferPrices),
        "SequentialPrices": host + createUrl("SequentialPrices", amountOfHours, dateRangeTomorrow, transferPrices),
      }
    }

  }

}

const createUrl = (queryMode: string, numberOfHours: number, dateRange: DateRange, transferPrices: TransferPrices) : string => {
  return `/query?queryMode=${queryMode}&hours=${numberOfHours}&startTime=${getTimestamp(dateRange.start)}&endTime=${getTimestamp(dateRange.end)}&offPeakTransferPrice=${transferPrices.offPeakTransfer}&peakTransferPrice=${transferPrices.peakTransfer}`
}

const getTimestamp = (date: Date) => {
  return date.getTime() / 1000
}

