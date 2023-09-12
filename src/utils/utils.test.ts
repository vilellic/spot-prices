import {describe, expect, test} from '@jest/globals';
import { PriceRow, PricesContainer, SpotPrices } from '../types/types';

const fixedFakeDate = new Date('2023-09-12')

jest.useFakeTimers()
    .setSystemTime(fixedFakeDate);

var utils = require("./utils");
let prices = {} as SpotPrices

test('test getPrice with VAT', () => {
  // VAT 24%
  expect(utils.getPrice(167.42)).toBe('0.20760')
})

beforeEach(() => {
  prices = require('./testPrices.json');
})

test('test getAveragePrice', () => {
  expect(utils.getAveragePrice(prices.today)).toBe('0.01185')
  expect(utils.getAveragePrice(prices.yesterday)).toBe('0.13479')
  expect(utils.getAveragePrice(prices.tomorrow)).toBe('0.11482')
})

test('test getCurrentPriceFromToday', () => {
  // At 3 AM
  expect(utils.getCurrentPriceFromTodayPrices(prices.today)).toBe('-0.00241')
})