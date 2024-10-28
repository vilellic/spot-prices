import { ControllerContext, SpotPrices, TransferPrices } from '../types/types';
import constants from '../types/constants';
import utils from '../utils/utils';
import links from '../services/links';

export default {
  handleLinks: function (ctx: ControllerContext) {
    const parsed = new URL(ctx.req?.url || '', `http://${ctx.req?.headers.host}`);
    const numberOfHours = Number(parsed.searchParams.get('hours'));

    const spotPrices = ctx.cache.get(constants.CACHED_NAME_PRICES) as SpotPrices;
    const tomorrowAvailable = utils.isPriceListComplete(spotPrices.tomorrow);
    const offPeakTransferPrice = Number(parsed.searchParams.get('offPeakTransferPrice'));
    const peakTransferPrice = Number(parsed.searchParams.get('peakTransferPrice'));
    const transferPrices: TransferPrices | undefined =
      offPeakTransferPrice && peakTransferPrice
        ? {
            offPeakTransfer: offPeakTransferPrice,
            peakTransfer: peakTransferPrice,
          }
        : undefined;

    ctx.res.end(
      JSON.stringify(
        links.getExampleLinks({
          host: `http://${ctx.req?.headers.host}`,
          tomorrowAvailable: tomorrowAvailable,
          noHours: numberOfHours,
          transferPrices: transferPrices,
        }),
        null,
        2,
      ),
    );
  },
};
