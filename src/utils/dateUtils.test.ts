import { expect, test } from '@jest/globals';

import dateUtils from './dateUtils';

// Tue Aug 22 2023 03:00:00 GMT+0300
const fixedFakeDate = new Date('2023-08-22');

jest.useFakeTimers().setSystemTime(fixedFakeDate);

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
