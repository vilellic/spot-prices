import { DateRange, LinksContainer, TransferPrices } from '../types/types';

import dateUtils from '../utils/dateUtils';
import { QueryMode } from './query';

export interface GetExampleLinksPars {
  host: string;
  tomorrowAvailable: boolean;
  noHours?: number;
  transferPrices?: TransferPrices;
}

export default {
  getExampleLinks: function ({
    host,
    tomorrowAvailable,
    noHours,
    transferPrices,
  }: GetExampleLinksPars): LinksContainer {
    const yesterday21 = dateUtils.getDateFromHourStarting(-1, 21).toJSDate();
    const today21 = dateUtils.getDateFromHourStarting(0, 21).toJSDate();
    const tomorrow21 = dateUtils.getDateFromHourStarting(1, 21).toJSDate();

    const amountOfHours: number = noHours ? noHours : 6;

    const dateRangeToday: DateRange = {
      start: yesterday21,
      end: today21,
    };

    const dateRangeTomorrow: DateRange = {
      start: today21,
      end: tomorrow21,
    };

    const tp: TransferPrices = transferPrices
      ? transferPrices
      : {
          peakTransfer: 0.0445,
          offPeakTransfer: 0.0274,
        };

    const queryModes = Object.values(QueryMode);

    const todayLinks = Object.fromEntries(
      queryModes.map((mode) => [mode, host + createUrl(mode, dateRangeToday, amountOfHours)]),
    );

    const tomorrowLinks = tomorrowAvailable
      ? Object.fromEntries(queryModes.map((mode) => [mode, host + createUrl(mode, dateRangeTomorrow, amountOfHours)]))
      : ['no prices yet...'];

    const todayLinksWithTransfer = Object.fromEntries(
      queryModes.map((mode) => [mode, host + createUrl(mode, dateRangeToday, amountOfHours, tp)]),
    );

    const tomorrowLinksWithTransfer = tomorrowAvailable
      ? Object.fromEntries(
          queryModes.map((mode) => [mode, host + createUrl(mode, dateRangeTomorrow, amountOfHours, tp)]),
        )
      : ['no prices yet...'];

    return {
      withoutTransferPrices: {
        today: todayLinks,
        tomorrow: tomorrowLinks,
      },
      withTransferPrices: {
        today: todayLinksWithTransfer,
        tomorrow: tomorrowLinksWithTransfer,
      },
    };
  },
};

const createUrl = (
  queryMode: QueryMode,
  dateRange: DateRange,
  numberOfHours?: number,
  transferPrices?: TransferPrices,
): string => {
  const noHoursPars = numberOfHours && queryMode !== QueryMode.AboveAveragePrices ? `&hours=${numberOfHours}` : '';
  const transferPricesPars = transferPrices
    ? `&offPeakTransferPrice=${transferPrices.offPeakTransfer}&peakTransferPrice=${transferPrices.peakTransfer}`
    : '';
  return `/query?queryMode=${queryMode}${noHoursPars}&startTime=${getTimestamp(dateRange.start)}&endTime=${getTimestamp(dateRange.end)}${transferPricesPars}`;
};

const getTimestamp = (date: Date) => {
  return date.getTime() / 1000;
};
