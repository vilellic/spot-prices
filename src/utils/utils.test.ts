import { expect, test } from '@jest/globals';
import { PriceRow, SpotPrices } from '../types/types';

const fixedFakeDate = new Date('2025-10-17');

jest.useFakeTimers().setSystemTime(fixedFakeDate);

import utils from './utils';
import dateUtils from './dateUtils';
let spotPrices = {} as SpotPrices;

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  spotPrices = require('./testPrices.json');
});

test('test getPrice with VAT', () => {
  expect(utils.getPrice(167.42)).toBe('0.21011');
});

test('test getPrice with VAT positive price', () => {
  expect(utils.getPrice(1)).toBe('0.00125');
});

test('test getPrice VAT with negative price', () => {
  expect(utils.getPrice(-500)).toBe('-0.50000');
});

test('test getPrice VAT with negative price', () => {
  expect(utils.getPrice(-1)).toBe('-0.00100');
});

test('test getAveragePrice', () => {
  expect(utils.getAveragePrice(dateUtils.getTodayTimeSlots(spotPrices.prices))).toBe('0.15604');
  expect(utils.getAveragePrice(dateUtils.getYesterdayTimeSlots(spotPrices.prices))).toBe('0.01634');
  expect(utils.getAveragePrice(dateUtils.getTomorrowTimeSlots(spotPrices.prices))).toBe('0.05860');
});

test('test getCurrentPriceFromToday', () => {
  expect(utils.getCurrentPrice(spotPrices.prices)).toBe('0.01813');
});

test('test time is in list range', () => {
  const todayHours = dateUtils.getTodayTimeSlots(spotPrices.prices);
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2025-10-17T05:03:42+0300').toJSDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2025-10-17T00:00:00+0300').toJSDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2025-10-17T23:59:59+0300').toJSDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2025-10-18T02:11:07+0300').toJSDate())).toBe(
    false,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2025-10-16T13:42:22+0300').toJSDate())).toBe(
    false,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2025-10-16T23:59:59+0300').toJSDate())).toBe(
    false,
  );
});

test('remove duplicates and sort', () => {
  const duplicatePrices: PriceRow[] = [
    {
      start: '2025-10-16T01:00:00.000+03:00',
      price: 0.00011,
    },
    {
      start: '2025-10-16T00:45:00.000+03:00',
      price: -0.00004,
    },
    {
      start: '2025-10-16T01:00:00.000+03:00',
      price: 0.00011,
    },
    {
      start: '2025-10-16T03:00:00.000+03:00',
      price: -0.00009,
    },
  ];
  expect(utils.removeDuplicatesAndSort(duplicatePrices)).toStrictEqual([
    {
      start: '2025-10-16T00:45:00.000+03:00',
      price: -0.00004,
    },
    {
      start: '2025-10-16T01:00:00.000+03:00',
      price: 0.00011,
    },
    {
      start: '2025-10-16T03:00:00.000+03:00',
      price: -0.00009,
    },
  ]);
});
