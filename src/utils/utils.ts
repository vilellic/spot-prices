import { getEmptySpotPrices, PriceRow, PriceRowWithTransfer, SpotPrices } from '../types/types';
import constants from '../types/constants';
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

  getPrice: function (inputPrice: number, vat: number = constants.VAT): string {
    return Number((Number(inputPrice) / 1000) * (Number(inputPrice) < 0 ? 1 : vat)).toFixed(5);
  },

  getCurrentPrice: function (prices: PriceRow[]) {
    const now = DateTime.now();
    const sortedPrices = [...prices].sort(
      (a, b) => DateTime.fromISO(b.start).toMillis() - DateTime.fromISO(a.start).toMillis(),
    );
    const currentPriceRow = sortedPrices.find((price) => DateTime.fromISO(price.start) <= now);
    return currentPriceRow!.price;
  },

  getSpotPricesFromCache: function (cache: NodeCache): SpotPrices {
    return cache.get(constants.CACHED_NAME_PRICES) || getEmptySpotPrices();
  },

  dateIsInPricesList: function (priceList: PriceRow[], date: Date): boolean {
    const targetDateTime = DateTime.fromJSDate(date);

    return priceList.some((price) => {
      const startDateTime = DateTime.fromISO(price.start);
      const endDateTime = startDateTime.plus({ minutes: 15 });
      return targetDateTime >= startDateTime && targetDateTime < endDateTime;
    });
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
