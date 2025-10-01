import { expect, test } from '@jest/globals';

import dateUtils from './dateUtils';
import { SpotPrices } from '../types/types';

// Tue Aug 22 2023 03:00:00 GMT+0300
const fixedFakeDate = new Date('2023-09-12');
let spotPrices = {} as SpotPrices;

jest.useFakeTimers().setSystemTime(fixedFakeDate);

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  spotPrices = require('./testPrices.json');
});

test('parse ISO date', () => {
  const parsedDate = dateUtils.parseISODate('2023-09-13T05:00:00+0300');
  expect(parsedDate.toUTC().toString()).toBe('2023-09-13T02:00:00.000Z');
  expect(new Date(parsedDate.valueOf())).toBeInstanceOf(Date);
});

test('test date str', () => {
  expect(dateUtils.getWeekdayAndHourStr(new Date())).toBe('3 Tue');
});

test('test is it time to get tomorrow prices', () => {
  expect(dateUtils.isTimeToGetTomorrowPrices()).toBe(false);
  fixedFakeDate.setHours(15, 42);
  expect(dateUtils.isTimeToGetTomorrowPrices(fixedFakeDate)).toBe(true);
});

test('get yesterday hours', () => {
  expect(dateUtils.getYesterdayTimeSlots(spotPrices.prices)[0]).toStrictEqual({
    start: '2023-09-11T00:00:00.000+03:00',
    price: '0.01879',
  });
});

test('get today hours', () => {
  expect(dateUtils.getTodayTimeSlots(spotPrices.prices)[0]).toStrictEqual({
    start: '2023-09-12T00:00:00.000+03:00',
    price: '-0.00149',
  });
});

test('get tomorrow hours', () => {
  expect(dateUtils.getTomorrowTimeSlots(spotPrices.prices)[0]).toStrictEqual({
    start: '2023-09-13T00:00:00.000+03:00',
    price: '0.01448',
  });
});

test('get hours to store', () => {
  expect(dateUtils.getHoursToStore(spotPrices.prices)[0]).toStrictEqual({
    start: '2023-09-11T00:00:00.000+03:00',
    price: '0.01879',
  });

  expect(dateUtils.getHoursToStore(spotPrices.prices).at(-1)).toStrictEqual({
    start: '2023-09-13T23:00:00.000+03:00',
    price: '0.01809',
  });
});
