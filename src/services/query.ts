import {
  DateRange,
  Hours,
  HoursContainer,
  PriceRow,
  PriceRowWithTransfer,
  SpotPrices,
  TransferPrices,
} from '../types/types';

import weighted from './weighted';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { DateTime } from 'luxon';
interface GetHoursParameters {
  spotPrices: SpotPrices;
  numberOfHours?: number;
  dateRange: DateRange;
  queryMode: QueryMode;
  transferPrices?: TransferPrices;
}

export enum QueryMode {
  WeightedPrices = 'WeightedPrices',
  SequentialPrices = 'SequentialPrices',
}

export default {
  getHours: function ({
    spotPrices,
    numberOfHours,
    dateRange,
    queryMode,
    transferPrices,
  }: GetHoursParameters): HoursContainer | undefined {
    // Validate queryMode parameter
    if (![QueryMode.WeightedPrices, QueryMode.SequentialPrices].includes(queryMode)) {
      return undefined;
    }

    if (numberOfHours === undefined) {
      return undefined;
    }

    const pricesFlat = [...spotPrices.prices] as PriceRowWithTransfer[];

    const withTransferPrices = transferPrices !== undefined;

    const timeFilteredPrices: PriceRowWithTransfer[] = pricesFlat.filter(
      (entry) =>
        dateUtils.parseISODate(entry.start).toMillis() >= dateRange.start.getTime() &&
        dateUtils.parseISODate(entry.start).toMillis() < dateRange.end.getTime(),
    );

    if (withTransferPrices) {
      for (let f = 0; f < timeFilteredPrices.length; f++) {
        const hour = new Date(timeFilteredPrices[f].start).getHours();
        timeFilteredPrices[f].priceWithTransfer =
          Number(timeFilteredPrices[f].price) +
          (hour >= 22 || hour < 7 ? transferPrices.offPeakTransfer : transferPrices.peakTransfer);
      }
    }

    let resultArray: PriceRowWithTransfer[] = [];

    if ([QueryMode.WeightedPrices, QueryMode.SequentialPrices].includes(queryMode) && numberOfHours) {
      resultArray = weighted.getWeightedPrices({
        numberOfHours: numberOfHours,
        priceList: timeFilteredPrices,
        useTransferPrices: withTransferPrices,
        queryMode: queryMode,
      });
    }

    const onlyPrices = resultArray.map((entry: PriceRow) => entry.price);
    const lowestPrice = Math.min(...onlyPrices);
    const highestPrice = Math.max(...onlyPrices);

    const hoursSet = new Set(
      resultArray.map((entry: PriceRow) => dateUtils.getWeekdayAndHourStr(new Date(entry.start))),
    );
    const hours = [...hoursSet];

    const currentHourDateStr = dateUtils.getWeekdayAndHourStr(new Date());
    const currentHourIsInList = hours.includes(currentHourDateStr);

    const startTimeIso = resultArray.at(0)?.start;
    const endTimeIso = resultArray.at(-1)?.start;

    const hoursObject: Hours = {
      startTime: startTimeIso ? DateTime.fromISO(startTimeIso).toISO() || 'unavailable' : 'unavailable',
      endTime: endTimeIso ? DateTime.fromISO(endTimeIso).plus({ hours: 1 }).toISO() || 'unavailable' : 'unavailable',
    };

    return {
      hours: hoursObject,
      info: {
        now: currentHourIsInList,
        min: lowestPrice,
        max: highestPrice,
        avg: Number(utils.getAveragePrice(resultArray)),
        ...(withTransferPrices && {
          withTransferPrices: {
            avg: Number(utils.getAveragePriceWithTransfer(resultArray)),
            min: Math.min(...resultArray.map((entry: PriceRowWithTransfer) => entry.priceWithTransfer)),
            max: Math.max(...resultArray.map((entry: PriceRowWithTransfer) => entry.priceWithTransfer)),
          },
        }),
      },
    };
  },
};
