import { PriceRow, SpotPrices } from '../types/types';
import constants from '../types/constants';
import { DateTime } from 'luxon';

export default {
  getDateStr: function (timestamp: number) {
    return this.getDate(timestamp).toISO();
  },

  getDate: function (timestamp: number) {
    return DateTime.fromSeconds(timestamp);
  },

  parseISODate: function (isoDateStr: string) {
    return DateTime.fromISO(isoDateStr);
  },

  getWeekdayAndHourStr: function (date: Date) {
    return new Date(date).getHours() + ' ' + DateTime.fromJSDate(date).toFormat('EEE');
  },

  getHourStr: function (input: string | undefined, addHours?: number) {
    if (!input) {
      return 'x';
    }
    return addToDateAndFormat(input, 'HH', addHours);
  },

  getIsoDateStr: function (input: string | undefined, addHours?: number) {
    return addToDateAndFormat(input, constants.ISO_DATE_FORMAT, addHours);
  },

  findIndexWithDate: function (datePriceArray: PriceRow[], date: string) {
    for (let i = 0; i < datePriceArray.length; i++) {
      if (datePriceArray[i].start === date) {
        return i;
      }
    }
    return undefined;
  },

  getDateFromFirstRow: function (datePriceArray: PriceRow[]) {
    return datePriceArray?.length > 0 ? this.parseISODate(datePriceArray[0].start).toFormat('DD-MM-YYYY') : undefined;
  },

  getTodaySpanStart: function () {
    return getDateSpanStartWithOffset(new Date(), 0).toISOString();
  },

  getTodaySpanEnd: function () {
    return getDateSpanEndWithOffset(new Date(), 0).toISOString();
  },

  getTomorrowSpanStart: function () {
    return getDateSpanStartWithOffset(new Date(), 1).toISOString();
  },

  getTomorrowSpanEnd: function () {
    return getDateSpanEndWithOffset(new Date(), 1).toISOString();
  },

  getYesterdaySpanStart: function () {
    return getDateSpanStartWithOffset(new Date(), -1).toISOString();
  },

  getYesterdaySpanEnd: function () {
    return getDateSpanEndWithOffset(new Date(), -1).toISOString();
  },

  getDateFromHourStarting: function (date: Date, offset: number, hour: number) {
    return DateTime.fromJSDate(date).plus({ day: offset }).set({ hour: hour, minute: 0, second: 0, millisecond: 0 });
  },

  sortByDate: function (array: PriceRow[]) {
    array.sort((a, b) => {
      return this.parseISODate(a.start).valueOf() - this.parseISODate(b.start).valueOf();
    });
  },

  isTimeToGetTomorrowPrices: function (now: Date = new Date()) {
    const date: Date = this.getDateFromHourStarting(new Date(), 0, 14).toJSDate();
    date.setMinutes(15);
    return now.valueOf() >= date.valueOf();
  },

  getYesterdayHours: function (prices: PriceRow[]) {
    return getDayHours(prices, -1);
  },

  getTodayHours: function (prices: PriceRow[]) {
    return getDayHours(prices, 0);
  },

  getTomorrowHours: function (prices: PriceRow[]) {
    return getDayHours(prices, 1);
  },

  getHoursToStore: function (prices: PriceRow[]) {
    return filterHours(
      prices,
      DateTime.fromJSDate(getDateSpanStartWithOffset(new Date(), -2)),
      DateTime.fromJSDate(getDateSpanEndWithOffset(new Date(), 1)),
    );
  },

  getTodayOffPeakHours: function (spotPrices: SpotPrices) {
    const yesterday22 = this.getDateFromHourStarting(new Date(), -1, 22);
    const today07 = this.getDateFromHourStarting(new Date(), 0, 7);
    return filterHours(spotPrices.prices, yesterday22, today07);
  },

  getTodayPeakHours: function (spotPrices: SpotPrices) {
    const today07 = this.getDateFromHourStarting(new Date(), 0, 7);
    const today22 = this.getDateFromHourStarting(new Date(), 0, 22);
    return filterHours(spotPrices.prices, today07, today22);
  },

  getTomorrowOffPeakHours: function (spotPrices: SpotPrices) {
    const today22 = this.getDateFromHourStarting(new Date(), 0, 22);
    const tomorrow07 = this.getDateFromHourStarting(new Date(), 1, 7);
    return filterHours(spotPrices.prices, today22, tomorrow07);
  },

  getTomorrowPeakHours: function (spotPrices: SpotPrices) {
    const tomorrow07 = this.getDateFromHourStarting(new Date(), 1, 7);
    const tomorrow22 = this.getDateFromHourStarting(new Date(), 1, 22);
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

const getDayHours = (prices: PriceRow[], offset: number) => {
  return filterHours(
    prices,
    DateTime.fromJSDate(getDateSpanStartWithOffset(new Date(), offset)),
    DateTime.fromJSDate(getDateSpanEndWithOffset(new Date(), offset)),
  );
};

const getDateSpanStartWithOffset = (date: Date, offset: number) => {
  date.setDate(date.getDate() + offset);
  date.setHours(0, 0, 0, 0);
  return date;
};

const getDateSpanEndWithOffset = (date: Date, offset: number) => {
  date.setDate(date.getDate() + offset);
  date.setHours(24, 0, 0, 0);
  date.setMilliseconds(date.getMilliseconds() - 1);
  return date;
};

const addToDateAndFormat = (input: string | undefined, format: string, addHours?: number) => {
  if (!input) {
    return undefined;
  }
  const date = new Date(input);
  if (addHours) {
    date.setHours(date.getHours() + addHours);
  }
  return DateTime.fromJSDate(date).toFormat(format);
};
