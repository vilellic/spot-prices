import NodeCache from 'node-cache';

export interface SpotPrices {
  prices: PriceRow[];
}

export const getEmptySpotPrices = (): SpotPrices => ({
  prices: [] as PriceRow[],
});

export interface PricesContainer {
  info: {
    current: string;
    averageToday: string;
    averageTodayOffPeak: string;
    averageTodayPeak: string;
    averageTomorrow?: string;
    averageTomorrowOffPeak?: string;
    averageTomorrowPeak?: string;
    tomorrowAvailable: boolean;
  };
  today: {
    start: string;
    price: string;
  }[];
  tomorrow: {
    start: string;
    price: string;
  }[];
}

export interface HoursContainer {
  hours: Hours;
  info: {
    now: boolean;
    min: number;
    max: number;
    avg: number;
  };
}

export interface Hours {
  list: string[];
  start?: string;
  end?: string;
  startTime?: string;
  endTime?: string;
}

export interface PriceRow {
  start: string;
  price: number;
}

export interface PriceRowWithTransfer extends PriceRow {
  priceWithTransfer: number;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TransferPrices {
  peakTransfer: number;
  offPeakTransfer: number;
}

export interface LinksContainer {
  withoutTransferPrices: {
    today: {};
    tomorrow: {};
  };
  withTransferPrices: {
    today: {};
    tomorrow: {};
  };
}

export interface ControllerContext {
  cache: NodeCache;
  url?: URL;
}

export interface EntsoTimeSeries {
  position: number;
  'price.amount': number;
}
export interface EleringResponseEntry {
  timestamp: number;
  price: number;
}
export interface EleringResponse {
  success: boolean;
  data: {
    ee: EleringResponseEntry[];
    fi: EleringResponseEntry[];
    lv: EleringResponseEntry[];
    lt: EleringResponseEntry[];
  };
}
