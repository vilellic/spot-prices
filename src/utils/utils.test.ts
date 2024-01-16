import { expect, test} from '@jest/globals';
import { SpotPrices } from '../types/types';

const fixedFakeDate = new Date('2023-09-12')

jest.useFakeTimers()
    .setSystemTime(fixedFakeDate);

var utils = require("./utils");
let prices = {} as SpotPrices

test('test getPrice with VAT', () => {
  expect(utils.getPrice(167.42)).toBe('0.20760')
})

test('test getPrice with VAT positive price', () => {
  expect(utils.getPrice(1)).toBe('0.00124')
})

test('test getPrice VAT with negative price', () => {
  expect(utils.getPrice(-500)).toBe('-0.50000')
})

test('test getPrice VAT with negative price', () => {
  expect(utils.getPrice(-1)).toBe('-0.00100')
})

beforeEach(() => {
  prices = require('./testPrices.json');
})

test('test getAveragePrice', () => {
  expect(utils.getAveragePrice(prices.today)).toBe('0.01185')
  expect(utils.getAveragePrice(prices.yesterday)).toBe('0.13479')
})

test('test getCurrentPriceFromToday', () => {
  // At 3 AM
  expect(utils.getCurrentPriceFromTodayPrices(prices.today)).toBe('-0.00241')
})