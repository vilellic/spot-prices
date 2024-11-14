import { PriceRow, SpotPrices } from '../types/types';
import moment from 'moment';
import constants from '../types/constants';

export default {
  getDateStr: function (timestamp: number) {
    return this.getDate(timestamp).format(constants.ISO_DATE_FORMAT);
  },

  getDate: function (timestamp: number) {
    const timestampNumber = Number(timestamp * 1000);
    const momentDate = moment(new Date(timestampNumber));
    return momentDate;
  },

  parseISODate: function (isoDateStr: string): moment.Moment {
    return moment(new Date(isoDateStr));
  },

  getWeekdayAndHourStr: function (date: Date) {
    return new Date(date).getHours() + ' ' + moment(date).format('ddd');
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
    return moment(getDateSpanStartWithOffset(new Date(), offset)).format('DD-MM-YYYY');
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

  getDateFromHourStarting: function (date: Date, offset: number, hour: number): moment.Moment {
    date.setDate(date.getDate() + offset);
    date.setHours(hour, 0, 0, 0);
    return moment(date);
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
    const priceRows = [...spotPrices.yesterday, ...spotPrices.today] as PriceRow[];
    const yesterday22 = this.getDateFromHourStarting(new Date(), -1, 22);
    const today07 = this.getDateFromHourStarting(new Date(), 0, 7);
    return this.filterHours(priceRows, yesterday22, today07);
  },

  getTodayPeakHours: function (spotPrices: SpotPrices) {
    const priceRows = [...spotPrices.today] as PriceRow[];
    const today07 = this.getDateFromHourStarting(new Date(), 0, 7);
    const today22 = this.getDateFromHourStarting(new Date(), 0, 22);
    return this.filterHours(priceRows, today07, today22);
  },

  getTomorrowOffPeakHours: function (spotPrices: SpotPrices) {
    const priceRows = [...spotPrices.today, ...(spotPrices.tomorrow ?? [])] as PriceRow[];
    const today22 = this.getDateFromHourStarting(new Date(), 0, 22);
    const tomorrow07 = this.getDateFromHourStarting(new Date(), 1, 7);
    return this.filterHours(priceRows, today22, tomorrow07);
  },

  getTomorrowPeakHours: function (spotPrices: SpotPrices) {
    const priceRows = [...spotPrices.today, ...(spotPrices.tomorrow ?? [])] as PriceRow[];
    const tomorrow07 = this.getDateFromHourStarting(new Date(), 1, 7);
    const tomorrow22 = this.getDateFromHourStarting(new Date(), 1, 22);
    return this.filterHours(priceRows, tomorrow07, tomorrow22);
  },

  filterHours: function (priceRows: PriceRow[], start: moment.Moment, end: moment.Moment) {
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
  return moment(date).format(format);
};
