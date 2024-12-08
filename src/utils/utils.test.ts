import { expect, test } from '@jest/globals';
import { PriceRow, SpotPrices } from '../types/types';

const fixedFakeDate = new Date('2023-09-12');

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
  expect(utils.getAveragePrice(dateUtils.getTodayHours(spotPrices.prices))).toBe('0.01185');
  expect(utils.getAveragePrice(dateUtils.getYesterdayHours(spotPrices.prices))).toBe('0.13479');
  expect(utils.getAveragePrice(dateUtils.getTomorrowHours(spotPrices.prices))).toBe('0.11482');
});

test('test getCurrentPriceFromToday', () => {
  // At 3 AM
  expect(utils.getCurrentPrice(spotPrices.prices)).toBe('-0.00241');
});

test('test time is in list range', () => {
  const todayHours = dateUtils.getTodayHours(spotPrices.prices);
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2023-09-12T05:03:42+0300').toJSDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2023-09-12T00:00:00+0300').toJSDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2023-09-12T23:59:59+0300').toJSDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2023-09-13T02:11:07+0300').toJSDate())).toBe(
    false,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2023-09-11T13:42:22+0300').toJSDate())).toBe(
    false,
  );
  expect(utils.dateIsInPricesList(todayHours, dateUtils.parseISODate('2023-09-11T23:59:59+0300').toJSDate())).toBe(
    false,
  );
});

test('remove duplicates and sort', () => {
  const duplicatePrices: PriceRow[] = [
    {
      start: '2023-09-11T03:00:00.000+03:00',
      price: 0.02003,
    },
    {
      start: '2023-09-11T00:00:00.000+03:00',
      price: 0.01879,
    },
    {
      start: '2023-09-11T01:00:00.000+03:00',
      price: 0.0237,
    },
    {
      start: '2023-09-11T01:00:00.000+03:00',
      price: 0.0237,
    },
  ];
  expect(utils.removeDuplicatesAndSort(duplicatePrices)).toStrictEqual([
    {
      start: '2023-09-11T00:00:00.000+03:00',
      price: 0.01879,
    },
    {
      start: '2023-09-11T01:00:00.000+03:00',
      price: 0.0237,
    },
    {
      start: '2023-09-11T03:00:00.000+03:00',
      price: 0.02003,
    },
  ]);
});
