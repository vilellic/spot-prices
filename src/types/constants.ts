module.exports = Object.freeze({
  CACHED_NAME_CURRENT: 'current',
  CACHED_NAME_PRICES: 'prices',
  VAT: 1.24
})

export interface SpotPrices {
  yesterday: PriceRow[],
  today: PriceRow[],
  tomorrow: PriceRow[]
}

export interface PricesContainer {
  info: {
    current: number,
    averageToday: number,
    averageTomorrow?: number,
    tomorrowAvailable: boolean,
  }
  today: PriceRow[]
  tomorrow: PriceRow[]
}

export interface PriceRow {
  start: Date,
  price: number,
}

export interface PriceRowWithTransfer extends PriceRow {
  priceWithTransfer: number,
}