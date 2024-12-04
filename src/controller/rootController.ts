import NodeCache from 'node-cache';
import { ControllerContext, getEmptySpotPrices, SpotPrices } from '../types/types';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { PricesContainer } from '../types/types';
import { Mutex } from 'async-mutex';
import entsoParser from '../parser/entsoParser';

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

      const yesterdayHoursMissing = dateUtils.getYesterdayHours(spotPrices.prices).length < 24;
      const todayHoursMissing = dateUtils.getTodayHours(spotPrices.prices).length < 24;
      const tomorrowHoursMissing =
        dateUtils.getTomorrowHours(spotPrices.prices).length < 24 && dateUtils.isTimeToGetTomorrowPrices();

      if (yesterdayHoursMissing || todayHoursMissing || tomorrowHoursMissing) {
        const periodStart = dateUtils.getDateFromHourStarting(new Date(), -1, 0).toFormat('yyyyMMddHHmm');
        const periodEnd = dateUtils.getDateFromHourStarting(new Date(), 2, 0).toFormat('yyyyMMddHHmm');
        spotPrices.prices = await getPricesFromEntsoe(periodStart, periodEnd);
        cache.set(constants.CACHED_NAME_PRICES, spotPrices);
      }
    });
  },
};

const getPricesFromEntsoe = async (start: string, end: string) => {
  const securityToken = process.env.ENTSOE_SECURITY_TOKEN;
  const url = `https://web-api.tp.entsoe.eu/api?documentType=A44&out_Domain=10YFI-1--------U&in_Domain=10YFI-1--------U&periodStart=${start}&periodEnd=${end}&securityToken=${securityToken}`;
  try {
    const res = await fetch(url, { method: 'Get' });
    return entsoParser.parseXML(await res.text());
  } catch (error) {
    console.log(error);
    return [];
  }
};

/*
const getPricesFromElering = async (start: string, end: string) => {
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
*/
