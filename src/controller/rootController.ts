import { ControllerContext, SpotPrices } from "../types/types";
var constants = require("../types/constants");
var utils = require("../utils/utils");
var dateUtils = require("../utils/dateUtils");
import { PricesContainer, PriceRow } from '../types/types';
import fetch from 'node-fetch';

module.exports = {

    handleRoot: async function (ctx: ControllerContext) {
        // Today and tomorrow prices
        let cachedPrices = ctx.cache.get(constants.CACHED_NAME_PRICES) as SpotPrices
        if (cachedPrices === undefined || cachedPrices.today.length === 0) {
            await this.updatePrices(ctx.cache)
            cachedPrices = ctx.cache.get(constants.CACHED_NAME_PRICES)
        }

        let currentPrice = utils.getCurrentPriceFromTodayPrices(cachedPrices.today)
        if (currentPrice === undefined) {
            // Current price was not found for some reason. Fallback to call API to fetch price
            const currentJson = await getCurrentJson()
            currentPrice = utils.getPrice(currentJson.data[0].price)
        }

        const tomorrowAvailable = utils.isPriceListComplete(cachedPrices.tomorrow)
        const avgTomorrowArray = tomorrowAvailable ? { averageTomorrow: utils.getAveragePrice(cachedPrices.tomorrow) } : []

        const prices: PricesContainer = {
            info: {
                current: currentPrice,
                averageToday: utils.getAveragePrice(cachedPrices.today),
                ...avgTomorrowArray,
                tomorrowAvailable: tomorrowAvailable,
            },
            today: cachedPrices.today,
            tomorrow: cachedPrices.tomorrow
        }
        ctx.res.end(JSON.stringify(prices))
    },

    handleCurrent: async function (ctx: ControllerContext) {
        // Current price
        let currentPrice = ctx.cache.get(constants.CACHED_NAME_CURRENT)
        if (currentPrice === undefined || Object.keys(currentPrice).length === 0) {
            await this.updateCurrentPrice(ctx.cache)
            currentPrice = ctx.cache.get(constants.CACHED_NAME_CURRENT)
        }
        ctx.res.end(JSON.stringify(currentPrice))
    },

    updatePrices: async function (cache: any) {
        let cachedPrices = cache.get(constants.CACHED_NAME_PRICES) as SpotPrices

        let prices = {} as SpotPrices
        if (cachedPrices === undefined) {
            cachedPrices = {
                yesterday: [],
                today: [],
                tomorrow: []
            } as SpotPrices
        } else {
            prices = {
                today: cachedPrices.today,
                tomorrow: cachedPrices.tomorrow,
                yesterday: cachedPrices.yesterday
            }
        }

        if (!utils.isPriceListComplete(cachedPrices.today)) {
            prices.today = await updateDayPrices(dateUtils.getTodaySpanStart(), dateUtils.getTodaySpanEnd())
        }
        if (!utils.isPriceListComplete(cachedPrices.tomorrow)) {
            prices.tomorrow = await updateDayPrices(dateUtils.getTomorrowSpanStart(), dateUtils.getTomorrowSpanEnd())
        }
        if (!utils.isPriceListComplete(cachedPrices.yesterday)) {
            prices.yesterday = await updateDayPrices(dateUtils.getYesterdaySpanStart(), dateUtils.getYesterdaySpanEnd())
        }

        cache.set(constants.CACHED_NAME_PRICES, prices)
    },

    updateCurrentPrice: async function (cache: any) {
        const json = await getCurrentJson()
        if (json.success === true) {
            const currentPrice = {
                price: utils.getPrice(json.data[0].price),
                start: dateUtils.getDateStr(json.data[0].timestamp)
            } as PriceRow
            cache.set(constants.CACHED_NAME_CURRENT, currentPrice)
        }
    }

}

async function getCurrentJson() {
    const url = `${constants.ELERING_API_PREFIX}/price/FI/current`
    const res = await fetch(url, { method: 'Get' })
    const json = await res.json()
    console.log(url)
    return json
}

const updateDayPrices = async (start: string, end: string) => {
    const prices = []

    const pricesJson = await getPricesJson(start, end)
    if (pricesJson.success === true) {
        for (let i = 0; i < pricesJson.data.fi.length; i++) {
            const priceRow: PriceRow = {
                start: dateUtils.getDateStr(pricesJson.data.fi[i].timestamp),
                price: utils.getPrice(pricesJson.data.fi[i].price)
            }
            prices.push(priceRow)
        }
    }

    return prices
}

async function getPricesJson(start: string, end: string) {
    const url = `${constants.ELERING_API_PREFIX}/price?start=${start}&end=${end}`
    const res = await fetch(url, { method: 'Get' })
    const json = await res.json()
    console.log(url)
    return json
}