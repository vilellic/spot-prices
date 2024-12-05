import { PriceRow, SpotPrices } from '../types/types';
import { DateTime } from 'luxon';

export default {
  getDate: function (timestamp: number) {
    return DateTime.fromSeconds(timestamp);
  },

  parseISODate: function (isoDateStr: string) {
    return DateTime.fromISO(isoDateStr);
  },

  getWeekdayAndHourStr: function (date: Date) {
    return DateTime.fromJSDate(date).toFormat('H EEE');
  },

  findIndexWithDate: function (datePriceArray: PriceRow[], date: string) {
    return datePriceArray.findIndex((row) => row.start === date) || undefined;
  },

  getDateFromHourStarting: function (offsetDays: number, hourStarting: number) {
    return DateTime.now().plus({ day: offsetDays }).set({ hour: hourStarting, minute: 0, second: 0, millisecond: 0 });
  },

  sortByDate: function (array: PriceRow[]) {
    array.sort((a, b) => {
      return this.parseISODate(a.start).valueOf() - this.parseISODate(b.start).valueOf();
    });
  },

  isTimeToGetTomorrowPrices: function (now: Date = new Date()) {
    const date = this.getDateFromHourStarting(0, 14);
    return DateTime.fromJSDate(now).valueOf() >= date.valueOf();
  },

  getDayHours: function (prices: PriceRow[], offset: number) {
    return filterHours(
      prices,
      this.getDateFromHourStarting(offset, 0),
      this.getDateFromHourStarting(offset, 24).minus({ milliseconds: 1 }),
    );
  },

  getYesterdayHours: function (prices: PriceRow[]) {
    return this.getDayHours(prices, -1);
  },

  getTodayHours: function (prices: PriceRow[]) {
    return this.getDayHours(prices, 0);
  },

  getTomorrowHours: function (prices: PriceRow[]) {
    return this.getDayHours(prices, 1);
  },

  getHoursToStore: function (prices: PriceRow[]) {
    return filterHours(
      prices,
      this.getDateFromHourStarting(-2, 0),
      this.getDateFromHourStarting(1, 24).minus({ milliseconds: 1 }),
    );
  },

  getTodayOffPeakHours: function (spotPrices: SpotPrices) {
    const yesterday22 = this.getDateFromHourStarting(-1, 22);
    const today07 = this.getDateFromHourStarting(0, 7);
    return filterHours(spotPrices.prices, yesterday22, today07);
  },

  getTodayPeakHours: function (spotPrices: SpotPrices) {
    const today07 = this.getDateFromHourStarting(0, 7);
    const today22 = this.getDateFromHourStarting(0, 22);
    return filterHours(spotPrices.prices, today07, today22);
  },

  getTomorrowOffPeakHours: function (spotPrices: SpotPrices) {
    const today22 = this.getDateFromHourStarting(0, 22);
    const tomorrow07 = this.getDateFromHourStarting(1, 7);
    return filterHours(spotPrices.prices, today22, tomorrow07);
  },

  getTomorrowPeakHours: function (spotPrices: SpotPrices) {
    const tomorrow07 = this.getDateFromHourStarting(1, 7);
    const tomorrow22 = this.getDateFromHourStarting(1, 22);
    return filterHours(spotPrices.prices, tomorrow07, tomorrow22);
  },
};

const filterHours = (priceRows: PriceRow[], start: DateTime, end: DateTime) => {
  return (
    priceRows?.filter((priceRow) => {
      const priceRowStart = DateTime.fromISO(priceRow.start);
      return priceRowStart.valueOf() >= start.valueOf() && priceRowStart.valueOf() < end.valueOf();
    }) || []
  );
};
