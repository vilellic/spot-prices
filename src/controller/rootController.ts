import NodeCache from 'node-cache';
import { ControllerContext, getEmptySpotPrices, SpotPrices } from '../types/types';
const constants = require('../types/constants');
const utils = require('../utils/utils');
const dateUtils = require('../utils/dateUtils');
import { PricesContainer, PriceRow } from '../types/types';
import fetch from 'node-fetch';

module.exports = {
  handleRoot: async function (ctx: ControllerContext) {
    if (!utils.isCacheReady(ctx.cache)) {
      await this.updatePrices(ctx.cache);
    }
    const cachedPrices = utils.getSpotPricesFromCache(ctx.cache);

    let currentPrice = utils.getCurrentPriceFromTodayPrices(cachedPrices.today);
    if (currentPrice === undefined) {
      const currentJson = await getCurrentJson();
      if (currentJson.success == true) {
        currentPrice = utils.getPrice(currentJson.data[0].price);
      }
    }

    const tomorrowAvailable = utils.isPriceListComplete(cachedPrices.tomorrow);
    const avgTomorrowArray = tomorrowAvailable ? { averageTomorrow: utils.getAveragePrice(cachedPrices.tomorrow) } : [];

    const prices: PricesContainer = {
      info: {
        current: currentPrice,
        averageToday: utils.getAveragePrice(cachedPrices.today),
        ...avgTomorrowArray,
        tomorrowAvailable: tomorrowAvailable,
      },
      today: cachedPrices.today,
      tomorrow: cachedPrices.tomorrow,
    };
    ctx.res.end(JSON.stringify(prices));
  },

  updatePrices: async function (cache: NodeCache) {
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
      (dateUtils.isTimeToGetTomorrowPrices() || cachedPrices.tomorrow.length == 0)
    ) {
      prices.tomorrow = await getDayPrices(dateUtils.getTomorrowSpanStart(), dateUtils.getTomorrowSpanEnd());
    }
    if (!utils.isPriceListComplete(cachedPrices.yesterday)) {
      prices.yesterday = await getDayPrices(dateUtils.getYesterdaySpanStart(), dateUtils.getYesterdaySpanEnd());
    }

    cache.set(constants.CACHED_NAME_PRICES, prices);
  },
};

async function getCurrentJson() {
  const url = `${constants.ELERING_API_PREFIX}/price/FI/current`;
  try {
    const res = await fetch(url, { method: 'Get' });
    const json = await res.json();
    console.log('getCurrentJson() = ' + url);
    return json;
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

const getDayPrices = async (start: string, end: string) => {
  const prices = [];

  const pricesJson = await getPricesJson(start, end);
  if (pricesJson.success === true) {
    for (let i = 0; i < pricesJson.data.fi.length; i++) {
      const priceRow: PriceRow = {
        start: dateUtils.getDateStr(pricesJson.data.fi[i].timestamp),
        price: utils.getPrice(pricesJson.data.fi[i].price),
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
    return json;
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}
