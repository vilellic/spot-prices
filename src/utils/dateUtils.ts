import { PriceRow } from "../types/types";
const moment = require("moment");

module.exports = {
  getDateStr: function (timestamp: number) {
    return this.getDate(timestamp).format("YYYY-MM-DDTHH:mm:ssZZ");
  },

  getDate: function (timestamp: number) {
    const timestampNumber = Number(timestamp * 1000);
    const momentDate = moment(new Date(timestampNumber));
    return momentDate;
  },

  parseISODate: function (isoDateStr: string) {
    return moment(new Date(isoDateStr));
  },

  getWeekdayAndHourStr: function (date: Date) {
    return new Date(date).getHours() + " " + moment(date).format("ddd");
  },

  findIndexWithDate: function (datePriceArray: PriceRow[], date: string) {
    for (let i = 0; i < datePriceArray.length; i++) {
      if (datePriceArray[i].start === date) {
        return i;
      }
    }
    return undefined;
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

  getDateFromHourStarting: function (
    date: Date,
    offset: number,
    hour: number,
  ): Date {
    date.setDate(date.getDate() + offset);
    date.setHours(hour, 0, 0, 0);
    return date;
  },

  sortByDate: function (array: PriceRow[]) {
    array.sort((a, b) => {
      return this.parseISODate(a.start) - this.parseISODate(b.start);
    });
  },

  isTimeToGetTomorrowPrices: function (now: Date = new Date()) {
    const date: Date = this.getDateFromHourStarting(new Date(), 0, 14);
    date.setMinutes(15);
    return now.valueOf() >= date.valueOf();
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
