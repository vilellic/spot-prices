import { describe, expect, test } from '@jest/globals';
import { PriceRow, PricesContainer, SpotPrices } from '../types/types';

const fixedFakeDate = new Date('2023-09-12')

jest.useFakeTimers()
  .setSystemTime(fixedFakeDate);

var queryProcessor = require("./queryProcessor");
let prices = {} as SpotPrices

beforeEach(() => {
  prices = require('../utils/testPrices.json');
})

test('test getHours', () => {
  const result = queryProcessor.getHours(prices, 3, '1694455200', '1694541600', false, false)
  expect(result).toStrictEqual(
    {
      "hours": [
        "1 Tue", 
        "2 Tue", 
        "3 Tue"
      ], 
      "info": 
      { 
        "avg": -0.00261, 
        "max": -0.00241, 
        "min": -0.00286, 
        "now": true 
      }
    })
})