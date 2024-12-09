import NodeCache from 'node-cache';
import { ControllerContext, getEmptySpotPrices, SpotPrices } from '../types/types';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { PricesContainer } from '../types/types';
import { Mutex } from 'async-mutex';
import entsoParser from '../parser/entsoParser';
import { DateTime } from 'luxon';

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
        dateUtils.getTomorrowHours(spotPrices.prices).length < 23 && dateUtils.isTimeToGetTomorrowPrices();

      if (yesterdayHoursMissing || todayHoursMissing || tomorrowHoursMissing) {
        const periodStart = dateUtils.getDateFromHourStarting(-1, 0).minus({ hours: 0 });
        const periodEnd = dateUtils.getDateFromHourStarting(2, 0);
        spotPrices.prices = await getPricesFromEntsoe(periodStart, periodEnd);
        if (spotPrices.prices.length > 0) {
          cache.set(constants.CACHED_NAME_PRICES, spotPrices);
        }
      }
    });
  },
};

const getPricesFromEntsoe = async (start: DateTime, end: DateTime) => {
  const securityToken = process.env.ENTSOE_SECURITY_TOKEN;
  console.log(`Query period start = ${start}, end = ${end}`);
  const url = `https://web-api.tp.entsoe.eu/api?documentType=A44&out_Domain=10YFI-1--------U&in_Domain=10YFI-1--------U&periodStart=${start.toFormat('yyyyMMddHHmm')}&periodEnd=${end.toFormat('yyyyMMddHHmm')}`;
  try {
    console.log(`Querying ENTSO-E Rest API with url = ${url}`);
    const res = await fetch(`${url}&securityToken=${securityToken}`, { method: 'Get' });
    return entsoParser.parseXML(await res.text());
  } catch (error) {
    console.log(error);
    return [];
  }
};
