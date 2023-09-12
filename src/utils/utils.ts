import { PriceRow } from "../types/types";
var constants = require("../types/constants");

module.exports = {

  getAveragePrice: function (pricesList: PriceRow[]) {
    const prices = pricesList.map(row => Number(row.price))
    const sum = prices.reduce((acc, price) => acc + price, 0)
    const avg = sum / prices.length
    return Number((avg).toFixed(5)).toString()
  },

  getPrice: function (inputPrice: Number) {
    return Number((Number(inputPrice) / 1000) * constants.VAT).toFixed(5)
  },

  getCurrentPriceFromTodayPrices: function (todayPrices: PriceRow[]) {
    if (todayPrices === undefined) {
      return undefined
    }
    const currentHour = new Date().getHours()
    let currentPrice
    for (let h = 0; h < todayPrices.length; h++) {
      if (new Date(todayPrices[h].start).getHours() === currentHour) {
        currentPrice = todayPrices[h].price
      }
    }
    return currentPrice
  }

}