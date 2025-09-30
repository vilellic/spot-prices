import { ControllerContext, DateRange, SpotPrices, TransferPrices } from '../types/types';
import constants from '../types/constants';
import dateUtils from '../utils/dateUtils';
import query, { QueryMode } from '../services/query';

export default {
  handleQuery: function (ctx: ControllerContext) {
    const url = ctx.url;
    const numberOfHours = Number(url?.searchParams.get('hours'));
    const startTime = Number(url?.searchParams.get('startTime'));
    const endTime = Number(url?.searchParams.get('endTime'));
    const queryModePar: string = url?.searchParams.get('queryMode') || 'LowestPrices';
    const offPeakTransferPrice = Number(url?.searchParams.get('offPeakTransferPrice'));
    const peakTransferPrice = Number(url?.searchParams.get('peakTransferPrice'));
    const transferPrices: TransferPrices | undefined =
      offPeakTransferPrice && peakTransferPrice
        ? {
            offPeakTransfer: offPeakTransferPrice,
            peakTransfer: peakTransferPrice,
          }
        : undefined;

    const queryMode = QueryMode[queryModePar as keyof typeof QueryMode];

    const dateRange: DateRange = {
      start: dateUtils.getDate(startTime).toJSDate(),
      end: dateUtils.getDate(endTime).toJSDate(),
    };

    if (!numberOfHours) {
      return this.getUnavailableResponse();
    } else {
      const spotPrices = ctx.cache.get(constants.CACHED_NAME_PRICES) as SpotPrices;
      const hours = query.getHours({
        spotPrices: spotPrices,
        numberOfHours: numberOfHours,
        dateRange: dateRange,
        queryMode: queryMode,
        transferPrices,
      });
      if (hours && numberOfHours >= 1 && numberOfHours <= 24) {
        return hours;
      } else {
        return this.getUnavailableResponse();
      }
    }
  },

  getUnavailableResponse: function () {
    return { hours: {} };
  },
};
