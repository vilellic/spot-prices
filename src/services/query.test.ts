import { expect, test } from '@jest/globals';
import { DateRange, SpotPrices } from '../types/types';

import dateUtils from '../utils/dateUtils';
import query, { QueryMode } from './query';

const fixedFakeDate = new Date('2025-10-16');

jest.useFakeTimers().setSystemTime(fixedFakeDate);

let prices = {} as SpotPrices;

const today21 = dateUtils.getDateFromHourStarting(0, 21);
const tomorrow21 = dateUtils.getDateFromHourStarting(1, 21);

const fromTodayDateRange: DateRange = {
  start: today21.toJSDate(),
  end: tomorrow21.toJSDate(),
};

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prices = require('../utils/testPrices.json');
});

test('test weighted getHours, 3 lowest', () => {
  const result = query.getHours({
    spotPrices: prices,
    numberOfHours: 3,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.LowestWeighted,
  });
  expect(result).toStrictEqual({
    hours: {
      startTime: '2025-10-17T01:00:00.000+03:00',
      endTime: '2025-10-17T04:00:00.000+03:00',
    },
    info: {
      avg: 0.01818,
      max: 0.01889,
      min: 0.01772,
      now: false,
    },
  });
});

test('test sequential getHours, 5 lowest', () => {
  const result = query.getHours({
    spotPrices: prices,
    numberOfHours: 5,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.LowestAverage,
  });

  expect(result).toStrictEqual({
    hours: {
      startTime: '2025-10-17T00:30:00.000+03:00',
      endTime: '2025-10-17T05:30:00.000+03:00',
    },
    info: {
      avg: 0.02069,
      max: 0.03136,
      min: 0.01772,
      now: false,
    },
  });
});

test('reports now during the final slot of the selected window', () => {
  jest.setSystemTime(new Date('2025-10-17T01:50:00+03:00'));
  const selectedPrices: SpotPrices = {
    prices: [
      { start: '2025-10-17T01:00:00.000+03:00', price: 1 },
      { start: '2025-10-17T01:15:00.000+03:00', price: 1 },
      { start: '2025-10-17T01:30:00.000+03:00', price: 1 },
      { start: '2025-10-17T01:45:00.000+03:00', price: 1 },
    ],
  };

  const result = query.getHours({
    spotPrices: selectedPrices,
    numberOfHours: 1,
    dateRange: {
      start: new Date('2025-10-17T01:00:00+03:00'),
      end: new Date('2025-10-17T02:00:00+03:00'),
    },
    queryMode: QueryMode.LowestAverage,
  });

  expect(result?.info.now).toBe(true);
});
