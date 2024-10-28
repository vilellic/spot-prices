import { IncomingMessage, ServerResponse } from 'http';
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
    averageTomorrow?: string;
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
  hours: string[];
  info: {
    now: boolean;
    min: number;
    max: number;
    avg: number;
  };
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
  res: ServerResponse;
  req?: IncomingMessage;
  cache: NodeCache;
}
