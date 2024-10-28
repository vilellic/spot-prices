import { expect, test } from '@jest/globals';
import { SpotPrices } from '../types/types';

const fixedFakeDate = new Date('2023-09-12');

jest.useFakeTimers().setSystemTime(fixedFakeDate);

import utils from './utils';
import dateUtils from './dateUtils';
let prices = {} as SpotPrices;

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  prices = require('./testPrices.json');
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
  expect(utils.getAveragePrice(prices.today)).toBe('0.01185');
  expect(utils.getAveragePrice(prices.yesterday)).toBe('0.13479');
});

test('test getCurrentPriceFromToday', () => {
  // At 3 AM
  expect(utils.getCurrentPriceFromTodayPrices(prices.today)).toBe('-0.00241');
});

test('test time is in list range', () => {
  expect(utils.dateIsInPricesList(prices.today, dateUtils.parseISODate('2023-09-12T05:03:42+0300').toDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(prices.today, dateUtils.parseISODate('2023-09-12T00:00:00+0300').toDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(prices.today, dateUtils.parseISODate('2023-09-12T23:59:59+0300').toDate())).toBe(
    true,
  );
  expect(utils.dateIsInPricesList(prices.today, dateUtils.parseISODate('2023-09-13T02:11:07+0300').toDate())).toBe(
    false,
  );
  expect(utils.dateIsInPricesList(prices.today, dateUtils.parseISODate('2023-09-11T13:42:22+0300').toDate())).toBe(
    false,
  );
  expect(utils.dateIsInPricesList(prices.today, dateUtils.parseISODate('2023-09-11T23:59:59+0300').toDate())).toBe(
    false,
  );
});
