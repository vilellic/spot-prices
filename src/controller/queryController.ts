import { ControllerContext, DateRange, SpotPrices, TransferPrices } from "../types/types";
var constants = require("../types/constants");
var dateUtils = require("../utils/dateUtils");
var query = require('../services/query')

module.exports = {

  handleQuery: function (ctx: ControllerContext) {
    const parsed = new URL(ctx.req?.url || '', `http://${ctx.req?.headers.host}`)
    const numberOfHours = Number(parsed.searchParams.get('hours'))
    const startTime = Number(parsed.searchParams.get('startTime'))
    const endTime = Number(parsed.searchParams.get('endTime'))
    const queryMode: string = parsed.searchParams.get('queryMode') || 'LowestPrices'
    const offPeakTransferPrice = Number(parsed.searchParams.get('offPeakTransferPrice'))
    const peakTransferPrice = Number(parsed.searchParams.get('peakTransferPrice'))
    const transferPrices: TransferPrices | undefined = offPeakTransferPrice && peakTransferPrice ? {
      offPeakTransfer: offPeakTransferPrice,
      peakTransfer: peakTransferPrice
    } : undefined

    const dateRange: DateRange = {
      start: dateUtils.getDate(startTime),
      end: dateUtils.getDate(endTime),
    }

    if (queryMode !== 'AboveAveragePrices' && !numberOfHours) {
      ctx.res.end(this.getUnavailableResponse())
      return
    } else {
      const spotPrices = ctx.cache.get(constants.CACHED_NAME_PRICES) as SpotPrices
      const hours = query.getHours({
        spotPrices: spotPrices, numberOfHours: numberOfHours,
        dateRange: dateRange, queryMode: queryMode, transferPrices
      })
      if (hours) {
        ctx.res.end(JSON.stringify(hours))
        return
      } else {
        ctx.res.end(this.getUnavailableResponse())
        return
      }
    }
  },

  getUnavailableResponse: function () {
    return JSON.stringify({ hours: [] })
  }

}