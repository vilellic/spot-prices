import NodeCache from 'node-cache';
import moment from 'moment';

export interface SpotPrices {
  yesterday: PriceRow[];
  today: PriceRow[];
  tomorrow: PriceRow[];
}

export const getEmptySpotPrices = (): SpotPrices => ({
  yesterday: [] as PriceRow[],
  today: [] as PriceRow[],
  tomorrow: [] as PriceRow[],
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
  start: moment.Moment;
  end: moment.Moment;
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
