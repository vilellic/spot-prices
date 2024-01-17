import { DateRange, LinksContainer, TransferPrices } from "../types/types";

var dateUtils = require("../utils/dateUtils");

export interface GetExampleLinksPars {
  host: string
  tomorrowAvailable: boolean
  noHours: number
  transferPrices: TransferPrices
}

module.exports = {

  getExampleLinks: function ({ host, tomorrowAvailable, noHours, transferPrices }: 
    GetExampleLinksPars): LinksContainer {

    const yesterday21: Date = dateUtils.getDateFromHourStarting(new Date(), -1, 21)
    const today21: Date = dateUtils.getDateFromHourStarting(new Date(), 0, 21)
    const tomorrow21: Date = dateUtils.getDateFromHourStarting(new Date(), 1, 21) 

    const amountOfHours: number = noHours ? noHours : 6;

    const dateRangeToday : DateRange = {
      start: yesterday21,
      end: today21,
    }

    const dateRangeTomorrow : DateRange = {
      start: today21,
      end: tomorrow21,
    }

    const tp: TransferPrices = transferPrices ? transferPrices : {
      peakTransfer: 0.0445,
      offPeakTransfer: 0.0274
    }

    const queryModes: string[] = [ 'LowestPrices', 'HighestPrices', 'OverAveragePrices', 
      'WeightedPrices', 'SequentialPrices' ]

    const todayLinks = Object.fromEntries(queryModes.map((mode) => (
      [mode, host + createUrl(mode, dateRangeToday, amountOfHours)]
    )))

    const tomorrowLinks = tomorrowAvailable ? Object.fromEntries(queryModes.map((mode) => (
      [mode, host + createUrl(mode, dateRangeTomorrow, amountOfHours)]
    ))) : [ 'no prices yet...' ]

    const todayLinksWithTransfer = Object.fromEntries(queryModes.map((mode) => (
      [mode, host + createUrl(mode, dateRangeToday, amountOfHours, tp)]
    )))
    
    const tomorrowLinksWithTransfer = tomorrowAvailable ? Object.fromEntries(queryModes.map((mode) => (
      [mode, host + createUrl(mode, dateRangeTomorrow, amountOfHours, tp)]
    ))) : [ 'no prices yet...' ]

    return {
      withoutTransferPrices: {
        today: todayLinks, 
        tomorrow: tomorrowLinks  
      },
      withTransferPrices: {
        today: todayLinksWithTransfer, 
        tomorrow: tomorrowLinksWithTransfer  
      } 
    }
  }

}

const createUrl = (queryMode: string, dateRange: DateRange, numberOfHours?: number, transferPrices?: TransferPrices) : string => {
  const noHoursPars = numberOfHours && queryMode !== 'OverAveragePrices' ? `&hours=${numberOfHours}` : ''
  const transferPricesPars =  transferPrices ? `&offPeakTransferPrice=${transferPrices.offPeakTransfer}&peakTransferPrice=${transferPrices.peakTransfer}` : ''
  return `/query?queryMode=${queryMode}${noHoursPars}&startTime=${getTimestamp(dateRange.start)}&endTime=${getTimestamp(dateRange.end)}${transferPricesPars}`
}

const getTimestamp = (date: Date) => {
  return date.getTime() / 1000
}

