import { PriceRowWithTransfer } from '../types/types';
import { QueryMode } from './query';

import dateUtils from '../utils/dateUtils';

interface WeightedPricesParameters {
  numberOfHours: number;
  rows: PriceRowWithTransfer[];
  useTransferPrices: boolean;
  queryMode: QueryMode;
}

export default {
  getWeightedPrices: function ({
    numberOfHours,
    rows,
    useTransferPrices,
    queryMode,
  }: WeightedPricesParameters): PriceRowWithTransfer[] {
    const numberOfEntries = numberOfHours * 4;

    const weightArray = [] as number[];
    if (queryMode === QueryMode.WeightedPrices) {
      const weightDivider = 10 / numberOfEntries;
      let index = 0;
      for (let i = 10; i > weightDivider; i = i - weightDivider) {
        weightArray[index] = i;
        index++;
      }
      if (weightArray.length === numberOfEntries - 1) {
        weightArray.push(weightDivider);
      }
    } else if (queryMode === QueryMode.SequentialPrices) {
      for (let w = 0; w < numberOfEntries - 1; w++) {
        weightArray.push(2);
      }
      weightArray.push(1.75);
    }
    console.log('weightArray', weightArray);

    const lastTestIndex = rows.length - numberOfEntries;
    const weightedResults = [];
    for (let t = 0; t < rows.length; t++) {
      if (t > lastTestIndex) {
        break;
      } else {
        weightedResults[t] = {
          start: rows[t].start,
          weightedResult: calculateWeightedSum(weightArray, numberOfEntries, rows, t, useTransferPrices),
        };
      }
    }

    const minWeightedResult = weightedResults.reduce(
      (min, w) => (w.weightedResult < min.weightedResult ? w : min),
      weightedResults[0],
    );
    const result = [] as PriceRowWithTransfer[];

    if (minWeightedResult !== undefined) {
      const indexOfWeightedResultFirstHour = dateUtils.findIndexWithDate(rows, minWeightedResult.start);
      let runningIndex = indexOfWeightedResultFirstHour || 0;
      for (let a = 0; a < numberOfEntries; a++) {
        result.push(rows[runningIndex++]);
      }
    }

    console.log('result', result);
    return result;
  },
};

const calculateWeightedSum = (
  weightArray: number[],
  numberOfEntries: number,
  rows: PriceRowWithTransfer[],
  index: number,
  useTransferPrices: boolean,
): number => {
  let result = 0;
  for (let i = 0; i < numberOfEntries; i++) {
    const price = useTransferPrices ? rows[index + i].priceWithTransfer : rows[index + i].price;
    result += price * weightArray[i];
  }
  return result;
};
