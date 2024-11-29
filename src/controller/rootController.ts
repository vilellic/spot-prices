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
    const tomorrowHours = dateUtils.getTomorrowHours(cachedPrices.prices);
    const tomorrowAvailable = tomorrowHours.length >= 23;
    const avgTomorrowArray = tomorrowAvailable ? { averageTomorrow: utils.getAveragePrice(tomorrowHours) } : [];
    const avgTomorrowOffPeakArray = tomorrowAvailable
      ? { averageTomorrowOffPeak: utils.getAveragePrice(dateUtils.getTomorrowOffPeakHours(cachedPrices)) }
      : [];
    const avgTomorrowPeakArray = tomorrowAvailable
      ? { averageTomorrowPeak: utils.getAveragePrice(dateUtils.getTomorrowPeakHours(cachedPrices)) }
      : [];

    const prices: PricesContainer = {
      info: {
        current: `${currentPrice?.toFixed(5)}`,
        averageToday: utils.getAveragePrice(dateUtils.getTodayHours(cachedPrices.prices)),
        averageTodayOffPeak: utils.getAveragePrice(dateUtils.getTodayOffPeakHours(cachedPrices)),
        averageTodayPeak: utils.getAveragePrice(dateUtils.getTodayPeakHours(cachedPrices)),
        tomorrowAvailable: tomorrowAvailable,
        ...avgTomorrowArray,
        ...avgTomorrowOffPeakArray,
        ...avgTomorrowPeakArray,
      },
      today: dateUtils
        .getTodayHours(cachedPrices.prices)
        .map((row) => ({ start: row.start, price: row.price.toFixed(5) })),
      tomorrow: tomorrowHours.map((row) => ({ start: row.start, price: row.price.toFixed(5) })),
    };

    return prices;
  },

  updatePrices: async function (cache: NodeCache) {
    await mutex.runExclusive(async () => {
      const spotPrices = cache.has(constants.CACHED_NAME_PRICES)
        ? (cache.get(constants.CACHED_NAME_PRICES) as SpotPrices)
        : getEmptySpotPrices();

      const yesterdayHours = dateUtils.getYesterdayHours(spotPrices.prices);
      const todayHours = dateUtils.getTodayHours(spotPrices.prices);
      const tomorrowHours = dateUtils.getTomorrowHours(spotPrices.prices);

      let start = undefined;
      if (yesterdayHours.length < 24) {
        start = dateUtils.getYesterdaySpanStart();
      } else if (todayHours.length < 24) {
        start = dateUtils.getTodaySpanStart();
      } else if (
        tomorrowHours.length < 24 &&
        (dateUtils.isTimeToGetTomorrowPrices() || !tomorrowHours || tomorrowHours.length === 0)
      ) {
        start = dateUtils.getTomorrowSpanStart();
      }
      if (start) {
        spotPrices.prices = await getDayPrices(start, dateUtils.getTomorrowSpanEnd());
      }
      cache.set(constants.CACHED_NAME_PRICES, spotPrices);
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
