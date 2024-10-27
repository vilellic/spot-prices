import { getEmptySpotPrices, PriceRow, PriceRowWithTransfer, SpotPrices } from '../types/types';
import constants from '../types/constants';
import dateUtils from './dateUtils';
import NodeCache from 'node-cache';

export default {
  getAveragePrice: function (pricesList: PriceRow[]) {
    const prices = pricesList.map((row) => Number(row.price));
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const avg = sum / prices.length;
    return Number(avg.toFixed(5)).toString();
  },

  getAveragePriceWithTransfer: function (pricesList: PriceRowWithTransfer[]) {
    const prices = pricesList.map((row) => Number(row.priceWithTransfer));
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const avg = sum / prices.length;
    return Number(avg.toFixed(5)).toString();
  },

  getPrice: function (inputPrice: number) {
    return Number((Number(inputPrice) / 1000) * (Number(inputPrice) < 0 ? 1 : constants.VAT)).toFixed(5);
  },

  getCurrentPriceFromTodayPrices: function (todayPrices: PriceRow[]) {
    if (todayPrices === undefined) {
      return undefined;
    }
    const currentHour = new Date().getHours();
    let currentPrice;
    for (let h = 0; h < todayPrices.length; h++) {
      if (new Date(todayPrices[h].start).getHours() === currentHour) {
        currentPrice = todayPrices[h].price;
      }
    }
    return currentPrice;
  },

  isPriceListComplete: function (priceList: PriceRow[]) {
    return priceList !== undefined && priceList.length >= 23;
  },

  getSpotPricesFromCache: function (cache: NodeCache): SpotPrices {
    return cache.get(constants.CACHED_NAME_PRICES) || getEmptySpotPrices();
  },

  isCacheReady: function (cache: NodeCache) {
    if (!cache.has(constants.CACHED_NAME_PRICES)) {
      return false;
    }
    const spotPrices: SpotPrices = cache.get(constants.CACHED_NAME_PRICES) || getEmptySpotPrices();
    return spotPrices.today.length > 0;
  },

  dateIsInPricesList: function (priceList: PriceRow[], date: Date) {
    if (priceList === undefined || priceList.length <= 1) {
      return false;
    }
    const start = dateUtils.parseISODate(priceList.at(0)?.start);
    const end = dateUtils.parseISODate(priceList.at(-1)?.start);
    end.add(1, 'hours');
    end.subtract(1, 'milliseconds');
    return date.valueOf() >= start.valueOf() && date.valueOf() <= end.valueOf();
  },
};
