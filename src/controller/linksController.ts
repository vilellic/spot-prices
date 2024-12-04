import { ControllerContext, SpotPrices, TransferPrices } from '../types/types';
import constants from '../types/constants';
import links from '../services/links';
import dateUtils from '../utils/dateUtils';

export default {
  handleLinks: function (ctx: ControllerContext) {
    const url = ctx.url;
    const numberOfHours = Number(url?.searchParams.get('hours'));

    const spotPrices = ctx.cache.get(constants.CACHED_NAME_PRICES) as SpotPrices;
    const tomorrowAvailable = dateUtils.getTomorrowHours(spotPrices.prices).length >= 23;
    const offPeakTransferPrice = Number(url?.searchParams.get('offPeakTransferPrice'));
    const peakTransferPrice = Number(url?.searchParams.get('peakTransferPrice'));
    const transferPrices: TransferPrices | undefined =
      offPeakTransferPrice && peakTransferPrice
        ? {
          offPeakTransfer: offPeakTransferPrice,
          peakTransfer: peakTransferPrice,
        }
        : undefined;

    return links.getExampleLinks({
      host: `${constants.PROTOCOL}://${url?.hostname}:${url?.port}`,
      tomorrowAvailable: tomorrowAvailable,
      noHours: numberOfHours,
      transferPrices: transferPrices,
    });
  },
};
