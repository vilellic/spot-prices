import { getEmptySpotPrices, PriceRow, PriceRowWithTransfer, SpotPrices } from '../types/types';
import constants from '../types/constants';
import dateUtils from './dateUtils';
import NodeCache from 'node-cache';
import dayjs from 'dayjs';

export default {
  getAveragePrice: function (pricesList: PriceRow[]) {
    const prices = pricesList.map((row) => Number(row.price));
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const avg = sum / prices.length;
    return Number(avg).toFixed(5);
  },

  getAveragePriceWithTransfer: function (pricesList: PriceRowWithTransfer[]) {
    const prices = pricesList.map((row) => Number(row.priceWithTransfer));
    const sum = prices.reduce((acc, price) => acc + price, 0);
    const avg = sum / prices.length;
    return Number(avg.toFixed(5)).toString();
  },

  getPrice: function (inputPrice: number): string {
    return Number((Number(inputPrice) / 1000) * (Number(inputPrice) < 0 ? 1 : constants.VAT)).toFixed(5);
  },

  getCurrentPrice: function (prices: PriceRow[]) {
    const currentHour = new Date().getHours();
    let currentPrice;
    for (let h = 0; h < prices.length; h++) {
      if (new Date(prices[h].start).getHours() === currentHour) {
        currentPrice = prices[h].price;
      }
    }
    return currentPrice;
  },

  getSpotPricesFromCache: function (cache: NodeCache): SpotPrices {
    return cache.get(constants.CACHED_NAME_PRICES) || getEmptySpotPrices();
  },

  dateIsInPricesList: function (priceList: PriceRow[], date: Date) {
    if (priceList === undefined || priceList.length <= 1) {
      return false;
    }
    const startStr = priceList.at(0)?.start;
    const endStr = priceList.at(-1)?.start;
    if (startStr && endStr) {
      const start = dateUtils.parseISODate(startStr);
      const end = dateUtils.parseISODate(endStr);
      end.add(1, 'hours');
      end.subtract(1, 'milliseconds');
      return date.valueOf() >= start.valueOf() && date.valueOf() <= end.valueOf();
    }
    return false;
  },

  removeDuplicatesAndSort: function (prices: PriceRow[]): PriceRow[] {
    const uniqueItems = new Map<string, PriceRow>();
    prices.forEach((item) => {
      uniqueItems.set(item.start, item);
    });
    const uniqueArray = Array.from(uniqueItems.values());
    return uniqueArray.sort((a, b) => dayjs(a.start).valueOf() - dayjs(b.start).valueOf());
  },
};
