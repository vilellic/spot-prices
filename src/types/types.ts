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