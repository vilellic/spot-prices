import { expect, test } from '@jest/globals';
import { DateRange, SpotPrices } from '../types/types';

import dateUtils from '../utils/dateUtils';
import query, { QueryMode } from './query';

// Will resolve to Tue Sep 12 2023 03:00:00 GMT+03:00 (Eastern European Summer Time)
const fixedFakeDate = new Date('2023-09-12');

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
    queryMode: QueryMode.WeightedPrices,
  });
  expect(result).toStrictEqual({
    hours: {
      startTime: '2023-09-13T03:00:00.000+03:00',
      endTime: '2023-09-13T06:00:00.000+03:00',
    },
    info: {
      now: false,
      min: 0.01104,
      max: 0.01207,
      avg: 0.0114,
    },
  });
});

test('test sequential getHours, 5 lowest', () => {
  const result = query.getHours({
    spotPrices: prices,
    numberOfHours: 5,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.SequentialPrices,
  });

  expect(result).toStrictEqual({
    hours: {
      startTime: '2023-09-13T01:00:00.000+03:00',
      endTime: '2023-09-13T06:00:00.000+03:00',
    },
    info: {
      now: false,
      min: 0.01104,
      max: 0.01244,
      avg: 0.01168,
    },
  });
});

test('test daylight saving time, duplicate hour', () => {
  const fixedFakeDate = new Date('2023-10-29');
  jest.useFakeTimers().setSystemTime(fixedFakeDate);

  const start = dateUtils.getDateFromHourStarting(0, 0).toJSDate();
  const end = dateUtils.getDateFromHourStarting(0, 6).toJSDate();

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const daylightPrices = require('../utils/testPricesDaylightSaving.json');
  const result = query.getHours({
    spotPrices: daylightPrices,
    numberOfHours: 5,
    dateRange: { start: start, end: end },
    queryMode: QueryMode.WeightedPrices,
  });

  expect(result).toStrictEqual({
    hours: {
      startTime: '2023-10-29T02:00:00.000+03:00',
      endTime: '2023-10-29T06:00:00.000+02:00',
    },
    info: {
      now: true,
      min: 0.02623,
      max: 0.03372,
      avg: 0.02926,
    },
  });
});
