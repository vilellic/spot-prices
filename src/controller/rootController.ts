import NodeCache from 'node-cache';
import {
  ControllerContext,
  EleringResponse,
  getEmptyPricesContainer,
  getEmptySpotPrices,
  PriceRow,
  SpotPrices,
} from '../types/types';
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

    if (cachedPrices.prices.length === 0) {
      return getEmptyPricesContainer();
    }

    const currentPrice = utils.getCurrentPrice(cachedPrices.prices);
    const tomorrowHours = dateUtils.getTomorrowTimeSlots(cachedPrices.prices);
    const tomorrowAvailable = tomorrowHours.length >= constants.TIME_SLOTS_IN_DAY - constants.TIME_SLOTS_IN_HOUR;
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

      const missingHours = utils.checkArePricesMissing(spotPrices.prices);
      if (missingHours) {
        const periodStart = dateUtils.getDateFromHourStarting(-2, 0);
        const periodEnd = dateUtils.getDateFromHourStarting(2, 0);
        spotPrices.prices = await getPricesFromEntsoe(periodStart, periodEnd);

        const missingHoursFromEntso = utils.checkArePricesMissing(spotPrices.prices);
        if (missingHoursFromEntso && dateUtils.isTimeToUseFallback()) {
          console.log('Some hours are still missing from ENTSO-E response. Trying to fetch them from Elering ...');
          const pricesFromElering = await getPricesFromElering(periodStart, periodEnd);
          const mergedPrices: PriceRow[] = [...(spotPrices.prices || []), ...pricesFromElering];
          const filteredPrices: PriceRow[] = utils.removeDuplicatesAndSort(dateUtils.getHoursToStore(mergedPrices));
          const newSpotPrices: SpotPrices = { prices: filteredPrices };
          if (!utils.checkArePricesMissing(newSpotPrices.prices)) {
            console.log('Got prices eventually from Elering!');
            spotPrices.prices = newSpotPrices.prices;
          } else {
            console.warn('There is still missing data .. skipping update');
          }
        } else {
          if (missingHoursFromEntso) {
            console.log('Not updated, waiting for ENTSO-E to have prices available');
          } else {
            console.log('Updated prices from ENTSO-E!');
          }
        }
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
    const res = await fetchWithTimeout(`${url}&securityToken=${securityToken}`, { method: 'GET' });
    return entsoParser.parseXML(await res.text());
  } catch (error) {
    console.log(error);
    return [];
  }
};

const getPricesFromElering = async (start: DateTime, end: DateTime) => {
  const prices = [];

  const eleringResponse = await fetchFromElering(start, end);
  if (eleringResponse.success === true) {
    for (let i = 0; i < eleringResponse.data.fi.length; i++) {
      const priceRow: PriceRow = {
        start: DateTime.fromSeconds(eleringResponse.data.fi[i].timestamp).toISO(),
        price: Number(utils.getPrice(eleringResponse.data.fi[i].price)),
      };
      prices.push(priceRow);
    }
  }

  return prices;
};

async function fetchFromElering(start: DateTime, end: DateTime) {
  const url = `${constants.ELERING_API_PREFIX}/price?start=${start.toUTC().toISO()}&end=${end.toUTC().toISO()}`;
  try {
    console.log(`Querying Elering Rest API with url = ${url}`);
    const res = await fetchWithTimeout(url, { method: 'GET' });
    const json = await res.json();
    console.log(url);
    return json as EleringResponse;
  } catch (error) {
    console.log(error);
    return { success: false } as EleringResponse;
  }
}

async function fetchWithTimeout(resource: string, options: RequestInit = {}, timeout: number = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => {
    controller.abort();
    console.log(`Request timed out for URL: ${resource}`);
  }, timeout);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    throw error;
  }
}
