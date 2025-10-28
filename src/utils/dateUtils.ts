import { PriceRow, SpotPrices } from '../types/types';
import { DateTime } from 'luxon';

export default {
  getDate: function (timestamp: number) {
    return DateTime.fromSeconds(timestamp);
  },

  parseISODate: function (isoDateStr: string) {
    return DateTime.fromISO(isoDateStr);
  },

  findIndexWithDate: function (datePriceArray: PriceRow[], date: string) {
    return datePriceArray.findIndex((row) => row.start === date) || undefined;
  },

  getDateFromHourStarting: function (offsetDays: number, hourStarting: number) {
    return DateTime.now().plus({ days: offsetDays }).set({ hour: hourStarting, minute: 0, second: 0, millisecond: 0 });
  },

  sortByDate: function (array: PriceRow[]) {
    array.sort((a, b) => {
      return this.parseISODate(a.start).valueOf() - this.parseISODate(b.start).valueOf();
    });
  },

  isTimeAfter: function (now: Date = new Date(), hour: number) {
    const date = this.getDateFromHourStarting(0, hour);
    return DateTime.fromJSDate(now).valueOf() >= date.valueOf();
  },

  isTimeToUseFallback: function (now: Date = new Date()) {
    return this.isTimeAfter(now, 15);
  },

  isTimeToGetTomorrowPrices: function (now: Date = new Date()) {
    return this.isTimeAfter(now, 14);
  },

  getTimeSlotsForDay: function (prices: PriceRow[], offset: number) {
    return filterTimeSlots(
      prices,
      this.getDateFromHourStarting(offset, 0),
      this.getDateFromHourStarting(offset, 24).minus({ milliseconds: 1 }),
    );
  },

  getYesterdayTimeSlots: function (prices: PriceRow[]) {
    return this.getTimeSlotsForDay(prices, -1);
  },

  getTodayTimeSlots: function (prices: PriceRow[]) {
    return this.getTimeSlotsForDay(prices, 0);
  },

  getTomorrowTimeSlots: function (prices: PriceRow[]) {
    return this.getTimeSlotsForDay(prices, 1);
  },

  getSlotsToStore: function (prices: PriceRow[]) {
    return filterTimeSlots(
      prices,
      this.getDateFromHourStarting(-2, 0),
      this.getDateFromHourStarting(1, 24).minus({ milliseconds: 1 }),
    );
  },

  getTodayOffPeakHours: function (spotPrices: SpotPrices) {
    const yesterday22 = this.getDateFromHourStarting(-1, 22);
    const today07 = this.getDateFromHourStarting(0, 7);
    return filterTimeSlots(spotPrices.prices, yesterday22, today07);
  },

  getTodayPeakHours: function (spotPrices: SpotPrices) {
    const today07 = this.getDateFromHourStarting(0, 7);
    const today22 = this.getDateFromHourStarting(0, 22);
    return filterTimeSlots(spotPrices.prices, today07, today22);
  },

  getTomorrowOffPeakHours: function (spotPrices: SpotPrices) {
    const today22 = this.getDateFromHourStarting(0, 22);
    const tomorrow07 = this.getDateFromHourStarting(1, 7);
    return filterTimeSlots(spotPrices.prices, today22, tomorrow07);
  },

  getTomorrowPeakHours: function (spotPrices: SpotPrices) {
    const tomorrow07 = this.getDateFromHourStarting(1, 7);
    const tomorrow22 = this.getDateFromHourStarting(1, 22);
    return filterTimeSlots(spotPrices.prices, tomorrow07, tomorrow22);
  },
};

const filterTimeSlots = (priceRows: PriceRow[], start: DateTime, end: DateTime) => {
  return (
    priceRows?.filter((priceRow) => {
      const priceRowStart = DateTime.fromISO(priceRow.start);
      return priceRowStart.valueOf() >= start.valueOf() && priceRowStart.valueOf() < end.valueOf();
    }) || []
  );
};
