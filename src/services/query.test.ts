import { describe, expect, test } from '@jest/globals';
import { PriceRow, PricesContainer, SpotPrices } from '../types/types';

var dateUtils = require("../utils/dateUtils");

// Will resolve to Tue Sep 12 2023 03:00:00 GMT+0300 (Eastern European Summer Time)
const fixedFakeDate = new Date('2023-09-12')

jest.useFakeTimers()
  .setSystemTime(fixedFakeDate);

var query = require("./query");
let prices = {} as SpotPrices

const yesterday21Ts = dateUtils.getTimestampFromHourStarting(new Date(), -1, 21)
const today21Ts = dateUtils.getTimestampFromHourStarting(new Date(), 0, 21)
const tomorrow21Ts = dateUtils.getTimestampFromHourStarting(new Date(), 1, 21)

beforeEach(() => {
  prices = require('../utils/testPrices.json');
})

test('test getHours, 3 lowest', () => {

  const today = query.getHours({spotPrices: prices, numberOfHours: 3, 
    startTime: yesterday21Ts, endTime: today21Ts, queryMode: QueryMode.LowestPrices, transferPrices: undefined})
    
  expect(today).toStrictEqual(
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

  const tomorrow = query.getHours(prices, 3, today21Ts, tomorrow21Ts, false, false)
  expect(tomorrow).toStrictEqual(
    {
      "hours": [
        "2 Wed",
        "3 Wed",
        "4 Wed"
      ],
      "info":
      {
        "min": 0.01104,
        "max": 0.01178,
        "avg": 0.0113,
        "now": false,
      }
    }
  )
})

test('test getHours, 1 lowest', () => {
  const result = query.getHours(prices, 1, yesterday21Ts, today21Ts, false, false)
  expect(result).toStrictEqual(
    {
      "hours": [
        "1 Tue",
      ],
      "info":
      {
        "avg": -0.00286,
        "max": -0.00286,
        "min": -0.00286,
        "now": false
      }
    })
})

test('test getHours, 8 lowest', () => {
  const result = query.getHours(prices, 8, yesterday21Ts, today21Ts, false, false)
  expect(result).toStrictEqual(
    {
      "hours": [
        "23 Mon",
        "0 Tue",
        "1 Tue",
        "2 Tue",
        "3 Tue",
        "4 Tue",
        "5 Tue",
        "6 Tue"
      ],
      "info": {
        "now": true,
        "min": -0.00286,
        "max": 0.00001,
        "avg": -0.00136
      }
    })
})

test('test getHours, 6 highest', () => {
  const today = query.getHours(prices, 6, yesterday21Ts, today21Ts, true, false)
  expect(today).toStrictEqual(
    {
      "hours": [
        "9 Tue",
        "10 Tue",
        "17 Tue",
        "18 Tue",
        "19 Tue",
        "20 Tue"
      ],
      "info": {
        "now": false,
        "min": 0.01789,
        "max": 0.02434,
        "avg": 0.02093
      }
    }
  )

  const tomorrow = query.getHours(prices, 6, today21Ts, tomorrow21Ts, true, false)
  expect(tomorrow).toStrictEqual(
    {
      "hours": [
        "9 Wed",
        "10 Wed",
        "11 Wed",
        "12 Wed",
        "17 Wed",
        "20 Wed"
      ],
      "info": {
        "now": false,
        "min": 0.19896,
        "max": 0.24807,
        "avg": 0.22954
      }
    }
  )
})

test('test weighted getHours, 3 lowest', () => {
  const result = query.getHours(prices, 3, today21Ts, tomorrow21Ts, false, true)
  console.log(JSON.stringify(result, null, 2))
  expect(result).toStrictEqual(
    {
      "hours": [
        "3 Wed",
        "4 Wed",
        "5 Wed"
      ],
      "info": {
        "now": false,
        "min": 0.01104,
        "max": 0.01207,
        "avg": 0.0114
      }
    }
  )
})