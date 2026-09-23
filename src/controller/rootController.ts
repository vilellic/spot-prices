import NodeCache from 'node-cache';
import { ControllerContext, getEmptyPricesContainer, getEmptySpotPrices, SpotPrices } from '../types/types';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { PricesContainer } from '../types/types';
import { Mutex } from 'async-mutex';
import { executeFallbackChain } from '../providers/fallbackChain';
import nordpoolProvider from '../providers/nordpoolProvider';
import entsoProvider from '../providers/entsoProvider';
import eleringProvider from '../providers/eleringProvider';

const mutex = new Mutex();

const providers = [nordpoolProvider, entsoProvider, eleringProvider];

export default {
  handleRoot: async function (ctx: ControllerContext) {
    const cachedPrices = utils.getSpotPricesFromCache(ctx.cache);

    if (cachedPrices.prices.length === 0) {
      return getEmptyPricesContainer();
    }

    const currentPrice = utils.getCurrentPrice(cachedPrices.prices);
    const tomorrowHours = dateUtils.getTomorrowTimeSlots(cachedPrices.prices);
    const tomorrowAvailable =
      tomorrowHours.length >= dateUtils.getExpectedTimeSlotsForDay(1) - constants.TIME_SLOTS_IN_HOUR;
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
        averageToday: utils.getAveragePrice(dateUtils.getTodayTimeSlots(cachedPrices.prices)),
        averageTodayOffPeak: utils.getAveragePrice(dateUtils.getTodayOffPeakHours(cachedPrices)),
        averageTodayPeak: utils.getAveragePrice(dateUtils.getTodayPeakHours(cachedPrices)),
        tomorrowAvailable: tomorrowAvailable,
        ...avgTomorrowArray,
        ...avgTomorrowOffPeakArray,
        ...avgTomorrowPeakArray,
      },
      today: dateUtils
        .getTodayTimeSlots(cachedPrices.prices)
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

      const missingSlots = utils.checkArePricesMissing(spotPrices.prices);
      if (missingSlots) {
        const periodStart = dateUtils.getDateFromHourStarting(-2, 0);
        const periodEnd = dateUtils.getDateFromHourStarting(2, 0);

        const result = await executeFallbackChain(providers, spotPrices.prices, periodStart, periodEnd);

        if (result.complete) {
          console.log(`Updated prices from: ${result.providersUsed.join(', ')}`);
          spotPrices.prices = dateUtils.getSlotsToStore(result.prices);
        } else if (result.prices.length > spotPrices.prices.length) {
          console.log(`Partial update from: ${result.providersUsed.join(', ')} (still missing data)`);
          spotPrices.prices = dateUtils.getSlotsToStore(result.prices);
        } else {
          console.log('Not updated, waiting for providers to have prices available');
          return;
        }

        if (spotPrices.prices.length > 0) {
          cache.set(constants.CACHED_NAME_PRICES, spotPrices);
        }
      }
    });
  },
};
