import { PriceRowWithTransfer } from '../types/types';
import { QueryMode } from './query';

interface QueryModesParameters {
  numberOfHours: number;
  rows: PriceRowWithTransfer[];
  useTransferPrices: boolean;
  queryMode: QueryMode;
}

export function getPrices({
  numberOfHours,
  rows,
  useTransferPrices,
  queryMode,
}: QueryModesParameters): PriceRowWithTransfer[] {
  const slotsPerHour = 4;
  const numSlots = numberOfHours * slotsPerHour;
  if (!Number.isInteger(numSlots) || numSlots <= 0) {
    throw new Error('numberOfHours must result in a positive integer number of 15-minute slots');
  }
  if (rows.length < numSlots) {
    return [];
  }

  const getPrice = (row: PriceRowWithTransfer) => (useTransferPrices ? row.priceWithTransfer : row.price);

  let weights: number[];
  let minimize = true;

  switch (queryMode) {
    case QueryMode.LowestWeighted:
      weights = Array.from({ length: numSlots }, (_, k) => numSlots - k);
      minimize = true;
      break;
    case QueryMode.LowestAverage:
      weights = Array.from({ length: numSlots }, () => 1);
      minimize = true;
      break;
    case QueryMode.HighestAverage:
      weights = Array.from({ length: numSlots }, () => 1);
      minimize = false;
      break;
    default:
      throw new Error('Invalid queryMode');
  }

  let bestScore = minimize ? Infinity : -Infinity;
  let bestIndex = -1;

  for (let i = 0; i <= rows.length - numSlots; i++) {
    let score = 0;
    for (let k = 0; k < numSlots; k++) {
      score += weights[k] * getPrice(rows[i + k]);
    }
    if ((minimize && score < bestScore) || (!minimize && score > bestScore)) {
      bestScore = score;
      bestIndex = i;
    }
  }

  if (bestIndex === -1) {
    throw new Error('No valid window found');
  }

  return rows.slice(bestIndex, bestIndex + numSlots);
}
