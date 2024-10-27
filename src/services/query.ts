import { DateRange, HoursContainer, PriceRow, PriceRowWithTransfer, SpotPrices, TransferPrices } from '../types/types';

import weighted from './weighted';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';

interface GetHoursParameters {
  spotPrices: SpotPrices;
  numberOfHours: number;
  dateRange: DateRange;
  queryMode: QueryMode;
  transferPrices?: TransferPrices;
}

export enum QueryMode {
  LowestPrices = 'LowestPrices',
  HighestPrices = 'HighestPrices',
  AboveAveragePrices = 'AboveAveragePrices',
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
    if (
      ![
        QueryMode.LowestPrices,
        QueryMode.HighestPrices,
        QueryMode.AboveAveragePrices,
        QueryMode.WeightedPrices,
        QueryMode.SequentialPrices,
      ].includes(queryMode)
    ) {
      return undefined;
    }

    if (queryMode !== QueryMode.AboveAveragePrices && numberOfHours === undefined) {
      return undefined;
    }

    const pricesFlat = [...spotPrices.yesterday, ...spotPrices.today, ...spotPrices.tomorrow] as PriceRowWithTransfer[];

    const withTransferPrices = transferPrices !== undefined;

    const timeFilteredPrices: PriceRowWithTransfer[] = pricesFlat.filter(
      (entry) =>
        dateUtils.parseISODate(entry.start) >= dateRange.start && dateUtils.parseISODate(entry.start) < dateRange.end,
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

    if ([QueryMode.WeightedPrices, QueryMode.SequentialPrices].includes(queryMode)) {
      resultArray = weighted.getWeightedPrices({
        numberOfHours: numberOfHours,
        priceList: timeFilteredPrices,
        useTransferPrices: withTransferPrices,
        queryMode: queryMode,
      });
    } else {
      if (queryMode === QueryMode.AboveAveragePrices) {
        const avgPriceAll = withTransferPrices
          ? Number(utils.getAveragePriceWithTransfer(timeFilteredPrices))
          : Number(utils.getAveragePrice(timeFilteredPrices));
        resultArray = timeFilteredPrices.filter((row: PriceRowWithTransfer) => {
          return withTransferPrices ? row.priceWithTransfer > avgPriceAll : row.price > avgPriceAll;
        });
      } else {
        // LowestPrices / HighestPrices
        timeFilteredPrices.sort((a, b) => {
          return withTransferPrices ? a.priceWithTransfer - b.priceWithTransfer : a.price - b.price;
        });

        if (queryMode === QueryMode.HighestPrices) {
          timeFilteredPrices.reverse();
        }

        resultArray = timeFilteredPrices.slice(0, numberOfHours);
        dateUtils.sortByDate(resultArray);
      }
    }

    const onlyPrices = resultArray.map((entry: PriceRow) => entry.price);
    const lowestPrice = Math.min(...onlyPrices);
    const highestPrice = Math.max(...onlyPrices);

    const hoursSet = new Set(resultArray.map((entry: PriceRow) => dateUtils.getWeekdayAndHourStr(entry.start)));
    const hours = [...hoursSet];

    const currentHourDateStr = dateUtils.getWeekdayAndHourStr(new Date());
    const currentHourIsInList = hours.includes(currentHourDateStr);

    return {
      hours,
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
