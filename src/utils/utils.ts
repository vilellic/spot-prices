import { getEmptySpotPrices, PriceRow, PriceRowWithTransfer, SpotPrices } from '../types/types';
import constants from '../types/constants';
import dateUtils from './dateUtils';
import NodeCache from 'node-cache';
import { DateTime } from 'luxon';

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
    const currentStartHour = DateTime.now().set({ minute: 0, second: 0, millisecond: 0 }).toISO();
    const matchingPriceRow = prices.find(price => DateTime.fromISO(price.start).toISO() === currentStartHour);
    return matchingPriceRow?.price;
  },

  getSpotPricesFromCache: function (cache: NodeCache): SpotPrices {
    return cache.get(constants.CACHED_NAME_PRICES) || getEmptySpotPrices();
  },

  dateIsInPricesList: function (priceList: PriceRow[], date: Date): boolean {
    if (priceList.length === 0) return false;

    const start = dateUtils.parseISODate(priceList[0].start);
    const end = dateUtils
      .parseISODate(priceList[priceList.length - 1].start)
      .plus({ hours: 1 })
      .minus({ milliseconds: 1 });

    const dateValue = date.valueOf();
    return dateValue >= start.valueOf() && dateValue <= end.valueOf();
  },

  removeDuplicatesAndSort: function (prices: PriceRow[]): PriceRow[] {
    const uniqueItems = new Map<string, PriceRow>();
    prices.forEach((item) => {
      uniqueItems.set(item.start, item);
    });
    const uniqueArray = Array.from(uniqueItems.values());
    return uniqueArray.sort((a, b) => DateTime.fromISO(a.start).valueOf() - DateTime.fromISO(b.start).valueOf());
  },
};
