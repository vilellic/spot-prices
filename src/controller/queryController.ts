import { ControllerContext, DateRange, SpotPrices, TransferPrices } from '../types/types';
import constants from '../types/constants';
import dateUtils from '../utils/dateUtils';
import query, { QueryMode } from '../services/query';

export default {
  handleQuery: function (ctx: ControllerContext) {
    const parsed = new URL(ctx.req?.url || '', `http://${ctx.req?.headers.host}`);
    const numberOfHours = Number(parsed.searchParams.get('hours'));
    const startTime = Number(parsed.searchParams.get('startTime'));
    const endTime = Number(parsed.searchParams.get('endTime'));
    const queryModePar: string = parsed.searchParams.get('queryMode') || 'LowestPrices';
    const offPeakTransferPrice = Number(parsed.searchParams.get('offPeakTransferPrice'));
    const peakTransferPrice = Number(parsed.searchParams.get('peakTransferPrice'));
    const transferPrices: TransferPrices | undefined =
      offPeakTransferPrice && peakTransferPrice
        ? {
            offPeakTransfer: offPeakTransferPrice,
            peakTransfer: peakTransferPrice,
          }
        : undefined;

    const queryMode = QueryMode[queryModePar as keyof typeof QueryMode];

    const dateRange: DateRange = {
      start: dateUtils.getDate(startTime),
      end: dateUtils.getDate(endTime),
    };

    if (queryMode !== QueryMode.AboveAveragePrices && !numberOfHours) {
      ctx.res.end(this.getUnavailableResponse());
    } else {
      const spotPrices = ctx.cache.get(constants.CACHED_NAME_PRICES) as SpotPrices;
      const hours = query.getHours({
        spotPrices: spotPrices,
        numberOfHours: numberOfHours,
        dateRange: dateRange,
        queryMode: queryMode,
        transferPrices,
      });
      if (hours) {
        ctx.res.end(JSON.stringify(hours, null, 2));
      } else {
        ctx.res.end(this.getUnavailableResponse());
      }
    }
  },

  getUnavailableResponse: function () {
    return JSON.stringify({ hours: [] });
  },
};
