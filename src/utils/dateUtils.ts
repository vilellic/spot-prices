import { PriceRow, SpotPrices } from '../types/types';
import constants from '../types/constants';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Europe/Helsinki")

export default {
  getDateStr: function (timestamp: number) {
    return dayjs(timestamp * 1000).toISOString();
  },

  getDate: function (timestamp: number) {
    // const tz = "Europe/Helsinki";
    return dayjs.tz(timestamp, "Europe/Helsinki");
  },

  parseISODate: function (isoDateStr: string): dayjs.Dayjs {
    return dayjs(isoDateStr);
  },

  getWeekdayAndHourStr: function (date: Date) {
    return new Date(date).getHours() + ' ' + dayjs(date).format('ddd');
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
    return datePriceArray?.length > 0 ? this.parseISODate(datePriceArray[0].start).format('DD-MM-YYYY') : undefined;
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

  getDateJsonName: function (offset: number) {
    return dayjs(getDateSpanStartWithOffset(new Date(), offset)).format('DD-MM-YYYY');
  },

  getTodayName: function () {
    return this.getDateJsonName(0);
  },

  getYesterdayName: function () {
    return this.getDateJsonName(-1);
  },

  getTomorrowName: function () {
    return this.getDateJsonName(1);
  },

  getDateFromHourStarting: function (date: Date, offset: number, hour: number): dayjs.Dayjs {
    date.setDate(date.getDate() + offset);
    date.setHours(hour, 0, 0, 0);
    return dayjs(date);
  },

  sortByDate: function (array: PriceRow[]) {
    array.sort((a, b) => {
      return this.parseISODate(a.start).valueOf() - this.parseISODate(b.start).valueOf();
    });
  },

  isTimeToGetTomorrowPrices: function (now: Date = new Date()) {
    const date: Date = this.getDateFromHourStarting(new Date(), 0, 14).toDate();
    date.setMinutes(15);
    return now.valueOf() >= date.valueOf();
  },

  getTodayOffPeakHours: function (spotPrices: SpotPrices) {
    const yesterday22 = this.getDateFromHourStarting(new Date(), -1, 22);
    const today07 = this.getDateFromHourStarting(new Date(), 0, 7);
    return this.filterHours(spotPrices.prices, yesterday22, today07);
  },

  getTodayPeakHours: function (spotPrices: SpotPrices) {
    const today07 = this.getDateFromHourStarting(new Date(), 0, 7);
    const today22 = this.getDateFromHourStarting(new Date(), 0, 22);
    return this.filterHours(spotPrices.prices, today07, today22);
  },

  getTomorrowOffPeakHours: function (spotPrices: SpotPrices) {
    const today22 = this.getDateFromHourStarting(new Date(), 0, 22);
    const tomorrow07 = this.getDateFromHourStarting(new Date(), 1, 7);
    return this.filterHours(spotPrices.prices, today22, tomorrow07);
  },

  getTomorrowPeakHours: function (spotPrices: SpotPrices) {
    const tomorrow07 = this.getDateFromHourStarting(new Date(), 1, 7);
    const tomorrow22 = this.getDateFromHourStarting(new Date(), 1, 22);
    return this.filterHours(spotPrices.prices, tomorrow07, tomorrow22);
  },

  filterHours: function (priceRows: PriceRow[], start: dayjs.Dayjs, end: dayjs.Dayjs) {
    return priceRows.filter((priceRow) => {
      const priceRowStart = this.parseISODate(priceRow.start);
      return priceRowStart.valueOf() >= start.valueOf() && priceRowStart.valueOf() < end.valueOf();
    });
  },
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
  return dayjs(date).format(format);
};
