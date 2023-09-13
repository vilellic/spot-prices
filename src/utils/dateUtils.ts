import { PriceRow } from "../types/types";
const moment = require('moment')

module.exports = {

  getDate: function (timestamp: number) {
    const timestampNumber = Number(timestamp * 1000)
    const momentDate = moment(new Date(timestampNumber))
    return momentDate.format('YYYY-MM-DDTHH:mm:ssZZ')
  },

  getWeekdayAndHourStr: function (date: Date) {
    return new Date(date).getHours() + ' ' + moment(date).format('ddd')
  },

  findIndexWithDate: function (datePriceArray: PriceRow[], date: Date) {
    for (let i = 0; i < datePriceArray.length; i++) {
      if (datePriceArray[i].start === date) {
        return i
      }
    }
    return undefined
  },

  getTodaySpanStart: function () {
    return getDateSpanStartWithOffset(new Date(), 0).toISOString()
  },

  getTodaySpanEnd: function () {
    return getDateSpanEndWithOffset(new Date(), 0).toISOString()
  },

  getTomorrowSpanStart: function () {
    return getDateSpanStartWithOffset(new Date(), 1).toISOString()
  },

  getTomorrowSpanEnd: function () {
    return getDateSpanEndWithOffset(new Date(), 1).toISOString()
  },

  getYesterdaySpanStart: function () {
    return getDateSpanStartWithOffset(new Date(), -1).toISOString()
  },

  getYesterdaySpanEnd: function () {
    return getDateSpanEndWithOffset(new Date(), -1).toISOString()
  },

  getTimestampFromHourStarting: function(date: Date, offset: number, hour: number): number {
    date.setDate(date.getDate() + offset)
    date.setHours(hour, 0, 0, 0)
    return date.getTime() / 1000
  },

  sortByDate: function (array: PriceRow[]) {
    array.sort((a, b) => {
      if (a.start > b.start) return 1
      else if (a.start < b.start) return -1
      else return 0
    })
  },

};

const getDateSpanStartWithOffset = (date: Date, offset: number) => {
  date.setDate(date.getDate() + offset)
  date.setHours(0, 0, 0, 0)
  return date
}

const getDateSpanEndWithOffset = (date: Date, offset: number) => {
  date.setDate(date.getDate() + offset)
  date.setHours(24, 0, 0, 0)
  date.setMilliseconds(date.getMilliseconds() - 1)
  return date
}