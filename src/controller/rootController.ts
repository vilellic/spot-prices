import NodeCache from 'node-cache';
import { ControllerContext, EleringResponse, getEmptySpotPrices, SpotPrices } from '../types/types';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { PricesContainer, PriceRow } from '../types/types';
import { Mutex } from 'async-mutex';

const mutex = new Mutex();

export default {
  handleRoot: async function (ctx: ControllerContext) {
    const cachedPrices = utils.getSpotPricesFromCache(ctx.cache);

    const currentPrice = utils.getCurrentPrice(cachedPrices.prices);
    const tomorrowAvailable = utils.isPriceListComplete(cachedPrices.prices);
    const avgTomorrowArray = tomorrowAvailable ? { averageTomorrow: utils.getAveragePrice(dateUtils.getTomorrowHours(cachedPrices)) } : [];
    const avgTomorrowOffPeakArray = tomorrowAvailable
      ? { averageTomorrowOffPeak: utils.getAveragePrice(dateUtils.getTomorrowOffPeakHours(cachedPrices)) }
      : [];
    const avgTomorrowPeakArray = tomorrowAvailable
      ? { averageTomorrowPeak: utils.getAveragePrice(dateUtils.getTomorrowPeakHours(cachedPrices)) }
      : [];

    const prices: PricesContainer = {
      info: {
        current: `${currentPrice?.toFixed(5)}`,
        averageToday: utils.getAveragePrice(dateUtils.getTodayHours(cachedPrices)),
        averageTodayOffPeak: utils.getAveragePrice(dateUtils.getTodayOffPeakHours(cachedPrices)),
        averageTodayPeak: utils.getAveragePrice(dateUtils.getTodayPeakHours(cachedPrices)),
        tomorrowAvailable: tomorrowAvailable,
        ...avgTomorrowArray,
        ...avgTomorrowOffPeakArray,
        ...avgTomorrowPeakArray,
      },
      today: dateUtils.getTodayHours(cachedPrices).map((row) => ({ start: row.start, price: row.price.toFixed(5) })),
      tomorrow: dateUtils.getTomorrowHours(cachedPrices).map((row) => ({ start: row.start, price: row.price.toFixed(5) })),
    };

    return prices;
  },

  updatePrices: async function (cache: NodeCache) {
    await mutex.runExclusive(async () => {
      const spotPrices = cache.has(constants.CACHED_NAME_PRICES) ? cache.get(constants.CACHED_NAME_PRICES) as SpotPrices : getEmptySpotPrices();
      if (!utils.isPriceListComplete(dateUtils.getYesterdaySpanStart, dateUtils.getTodaySpanEnd())) {

      }
      /*
      let cachedPrices = cache.get(constants.CACHED_NAME_PRICES) as SpotPrices;
      let prices = {} as SpotPrices;
      if (cachedPrices === undefined) {
        cachedPrices = getEmptySpotPrices();
      } else {
        prices = {
          today: cachedPrices.today,
          tomorrow: cachedPrices.tomorrow,
          yesterday: cachedPrices.yesterday,
        };
      }

      if (!utils.isPriceListComplete(cachedPrices.today)) {
        prices.today = await getDayPrices(dateUtils.getTodaySpanStart(), dateUtils.getTodaySpanEnd());
      }
      if (
        !utils.isPriceListComplete(cachedPrices.tomorrow) &&
        (dateUtils.isTimeToGetTomorrowPrices() || !cachedPrices.tomorrow || cachedPrices.tomorrow.length === 0)
      ) {
        prices.tomorrow = await getDayPrices(dateUtils.getTomorrowSpanStart(), dateUtils.getTomorrowSpanEnd());
      }
      if (!utils.isPriceListComplete(cachedPrices.yesterday)) {
        prices.yesterday = await getDayPrices(dateUtils.getYesterdaySpanStart(), dateUtils.getYesterdaySpanEnd());
      }

      cache.set(constants.CACHED_NAME_PRICES, prices);
      */
    });
  },
};

const getDayPrices = async (start: string, end: string) => {
  const prices = [];

  const eleringResponse = await getPricesJson(start, end);
  if (eleringResponse.success === true) {
    for (let i = 0; i < eleringResponse.data.fi.length; i++) {
      const priceRow: PriceRow = {
        start: dateUtils.getDateStr(eleringResponse.data.fi[i].timestamp),
        price: Number(utils.getPrice(eleringResponse.data.fi[i].price)),
      };
      prices.push(priceRow);
    }
  }

  return prices;
};

async function getPricesJson(start: string, end: string) {
  const url = `${constants.ELERING_API_PREFIX}/price?start=${start}&end=${end}`;
  try {
    const res = await fetch(url, { method: 'Get' });
    const json = await res.json();
    console.log(url);
    return json as Promise<EleringResponse>;
  } catch (error) {
    console.log(error);
    return { success: false } as EleringResponse;
  }
}
