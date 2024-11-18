import { ControllerContext, SpotPrices, TransferPrices } from '../types/types';
import constants from '../types/constants';
import utils from '../utils/utils';
import links from '../services/links';

export default {
  handleLinks: function (ctx: ControllerContext) {
    const url = ctx.url;
    const numberOfHours = Number(url?.searchParams.get('hours'));

    const spotPrices = ctx.cache.get(constants.CACHED_NAME_PRICES) as SpotPrices;
    const tomorrowAvailable = utils.isPriceListComplete(spotPrices.tomorrow);
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
      host: `${constants.PROTOCOL}://${url?.hostname}:${constants.PORT}`,
      tomorrowAvailable: tomorrowAvailable,
      noHours: numberOfHours,
      transferPrices: transferPrices,
    });
  },
};
