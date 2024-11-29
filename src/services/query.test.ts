import { expect, test } from '@jest/globals';
import { DateRange, SpotPrices, TransferPrices } from '../types/types';

import dateUtils from '../utils/dateUtils';
import query, { QueryMode } from './query';

// Will resolve to Tue Sep 12 2023 03:00:00 GMT+03:00 (Eastern European Summer Time)
const fixedFakeDate = new Date('2023-09-12');

jest.useFakeTimers().setSystemTime(fixedFakeDate);

let prices = {} as SpotPrices;

const yesterday21 = dateUtils.getDateFromHourStarting(new Date(), -1, 21);
const today21 = dateUtils.getDateFromHourStarting(new Date(), 0, 21);
const tomorrow21 = dateUtils.getDateFromHourStarting(new Date(), 1, 21);

const fromYesterdayDateRange: DateRange = {
  start: yesterday21.toJSDate(),
  end: today21.toJSDate(),
};

const fromTodayDateRange: DateRange = {
  start: today21.toJSDate(),
  end: tomorrow21.toJSDate(),
};

const transferPrices: TransferPrices = {
  peakTransfer: 0.0445,
  offPeakTransfer: 0.0274,
};

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prices = require('../utils/testPrices.json');
});

test('test getHours, 3 lowest', () => {
  const today = query.getHours({
    spotPrices: prices,
    numberOfHours: 3,
    dateRange: fromYesterdayDateRange,
    queryMode: QueryMode.LowestPrices,
  });

  expect(today).toStrictEqual({
    hours: {
      list: ['1 Tue', '2 Tue', '3 Tue'],
    },
    info: {
      avg: -0.00261,
      max: -0.00241,
      min: -0.00286,
      now: true,
    },
  });

  const tomorrow = query.getHours({
    spotPrices: prices,
    numberOfHours: 3,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.LowestPrices,
  });
  expect(tomorrow).toStrictEqual({
    hours: {
      list: ['2 Wed', '3 Wed', '4 Wed'],
    },
    info: {
      min: 0.01104,
      max: 0.01178,
      avg: 0.0113,
      now: false,
    },
  });
});

test('test getHours with transfer', () => {
  const withTransfer = query.getHours({
    spotPrices: prices,
    numberOfHours: 14,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.LowestPrices,
    transferPrices: transferPrices,
  });

  expect(withTransfer).toStrictEqual({
    hours: {
      list: [
        '21 Tue',
        '22 Tue',
        '23 Tue',
        '0 Wed',
        '1 Wed',
        '2 Wed',
        '3 Wed',
        '4 Wed',
        '5 Wed',
        '6 Wed',
        '7 Wed',
        '14 Wed',
        '15 Wed',
        '16 Wed',
      ],
    },
    info: {
      now: false,
      min: 0.01104,
      max: 0.14879,
      avg: 0.0419,
      withTransferPrices: {
        avg: 0.0754,
        min: 0.03844,
        max: 0.19329000000000002,
      },
    },
  });
});

test('test getHours, 1 lowest', () => {
  const result = query.getHours({
    spotPrices: prices,
    numberOfHours: 1,
    dateRange: fromYesterdayDateRange,
    queryMode: QueryMode.LowestPrices,
  });
  expect(result).toStrictEqual({
    hours: {
      list: ['1 Tue'],
    },
    info: {
      avg: -0.00286,
      max: -0.00286,
      min: -0.00286,
      now: false,
    },
  });
});

test('test getHours, 8 lowest', () => {
  const result = query.getHours({
    spotPrices: prices,
    numberOfHours: 8,
    dateRange: fromYesterdayDateRange,
    queryMode: QueryMode.LowestPrices,
  });
  expect(result).toStrictEqual({
    hours: {
      list: ['23 Mon', '0 Tue', '1 Tue', '2 Tue', '3 Tue', '4 Tue', '5 Tue', '6 Tue'],
    },
    info: {
      now: true,
      min: -0.00286,
      max: 0.00001,
      avg: -0.00136,
    },
  });
});

test('test getHours, 6 highest', () => {
  const today = query.getHours({
    spotPrices: prices,
    numberOfHours: 6,
    dateRange: fromYesterdayDateRange,
    queryMode: QueryMode.HighestPrices,
  });
  expect(today).toStrictEqual({
    hours: {
      list: ['9 Tue', '10 Tue', '17 Tue', '18 Tue', '19 Tue', '20 Tue'],
    },
    info: {
      now: false,
      min: 0.01789,
      max: 0.02434,
      avg: 0.02093,
    },
  });

  const tomorrow = query.getHours({
    spotPrices: prices,
    numberOfHours: 6,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.HighestPrices,
  });
  expect(tomorrow).toStrictEqual({
    hours: {
      list: ['9 Wed', '10 Wed', '11 Wed', '12 Wed', '17 Wed', '20 Wed'],
    },
    info: {
      now: false,
      min: 0.19896,
      max: 0.24807,
      avg: 0.22954,
    },
  });
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
      list: ['3 Wed', '4 Wed', '5 Wed'],
      start: '03',
      end: '06',
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
      list: ['1 Wed', '2 Wed', '3 Wed', '4 Wed', '5 Wed'],
      start: '01',
      end: '06',
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

test('test above avg. prices', () => {
  const result = query.getHours({
    spotPrices: prices,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.AboveAveragePrices,
  });

  expect(result).toStrictEqual({
    hours: {
      list: [
        '8 Wed',
        '9 Wed',
        '10 Wed',
        '11 Wed',
        '12 Wed',
        '13 Wed',
        '14 Wed',
        '15 Wed',
        '16 Wed',
        '17 Wed',
        '18 Wed',
        '19 Wed',
        '20 Wed',
      ],
    },
    info: {
      now: false,
      min: 0.11437,
      max: 0.24807,
      avg: 0.1924,
    },
  });
});

test('test above avg. prices with transfer', () => {
  const result = query.getHours({
    spotPrices: prices,
    dateRange: fromTodayDateRange,
    queryMode: QueryMode.AboveAveragePrices,
    transferPrices: transferPrices,
  });

  expect(result).toStrictEqual({
    hours: {
      list: [
        '8 Wed',
        '9 Wed',
        '10 Wed',
        '11 Wed',
        '12 Wed',
        '13 Wed',
        '14 Wed',
        '15 Wed',
        '16 Wed',
        '17 Wed',
        '18 Wed',
        '19 Wed',
        '20 Wed',
      ],
    },
    info: {
      now: false,
      min: 0.11437,
      max: 0.24807,
      avg: 0.1924,
      withTransferPrices: {
        avg: 0.2369,
        max: 0.29257,
        min: 0.15887,
      },
    },
  });
});

test('test daylight saving time, duplicate hour', () => {
  const fixedFakeDate = new Date('2023-10-29');
  jest.useFakeTimers().setSystemTime(fixedFakeDate);

  const start = dateUtils.getDateFromHourStarting(new Date(), 0, 0).toJSDate();
  const end = dateUtils.getDateFromHourStarting(new Date(), 0, 6).toJSDate();

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
      list: ['2 Sun', '3 Sun', '4 Sun', '5 Sun'],
      start: '02',
      end: '06',
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
