import { ServerResponse } from "http"

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
  
  export interface HoursContainer {
    hours: string[]
    info: {
      now: boolean,
      min: number,
      max: number,
      avg: number
    }
  }

  export interface PriceRow {
    start: string,
    price: number,
  }
  
  export interface PriceRowWithTransfer extends PriceRow {
    priceWithTransfer: number,
  }

  export interface DateRange {
    start: Date,
    end: Date
  }

  export interface TransferPrices {
    peakTransfer: number,
    offPeakTransfer: number
  }

  export interface LinksContainer {
    withoutTransferPrices: {
      today: {}
      tomorrow: {}  
    }
    withTransferPrices: {
      today: {}
      tomorrow: {}  
    }
  }

  export interface ControllerContext {
    res: ServerResponse;
    cache: any;
  }