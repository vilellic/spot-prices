import { expect, test } from '@jest/globals';

import dateUtils from './dateUtils';
import { SpotPrices } from '../types/types';

const fixedFakeDate = new Date('2025-10-17');
let spotPrices = {} as SpotPrices;

jest.useFakeTimers().setSystemTime(fixedFakeDate);

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  spotPrices = require('./testPrices.json');
});

test('parse ISO date', () => {
  const parsedDate = dateUtils.parseISODate('2025-10-17T05:00:00+0300');
  expect(parsedDate.toUTC().toString()).toBe('2025-10-17T02:00:00.000Z');
  expect(new Date(parsedDate.valueOf())).toBeInstanceOf(Date);
});

test('test is it time to get tomorrow prices', () => {
  expect(dateUtils.isTimeToGetTomorrowPrices()).toBe(false);
  fixedFakeDate.setHours(15, 42);
  expect(dateUtils.isTimeToGetTomorrowPrices(fixedFakeDate)).toBe(true);
});

test('get yesterday hours', () => {
  // First available slot for yesterday (2025-10-16) in testPrices starts at 01:00
  expect(dateUtils.getYesterdayTimeSlots(spotPrices.prices)[0]).toStrictEqual({
    start: '2025-10-16T01:00:00.000+03:00',
    price: '-0.0001',
  });
});

test('get today hours', () => {
  expect(dateUtils.getTodayTimeSlots(spotPrices.prices)[0]).toStrictEqual({
    start: '2025-10-17T00:00:00.000+03:00',
    price: '0.03858',
  });
});

test('get tomorrow hours', () => {
  expect(dateUtils.getTomorrowTimeSlots(spotPrices.prices)[0]).toStrictEqual({
    start: '2025-10-18T00:00:00.000+03:00',
    price: '0.13284',
  });
});

test('get hours to store', () => {
  // Hours to store spans two days back to tomorrow; first slot present is 2025-10-16T01:00 and last slot 2025-10-18T23:45
  expect(dateUtils.getSlotsToStore(spotPrices.prices)[0]).toStrictEqual({
    start: '2025-10-16T01:00:00.000+03:00',
    price: '-0.0001',
  });
  expect(dateUtils.getSlotsToStore(spotPrices.prices).at(-1)).toStrictEqual({
    start: '2025-10-18T23:45:00.000+03:00',
    price: '0.00428',
  });
});
