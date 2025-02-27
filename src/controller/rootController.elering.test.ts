import fetchMock from 'jest-fetch-mock';
import { readFileSync } from 'fs';
import { join } from 'path';
import rootController from './rootController';
import NodeCache from 'node-cache';
import constants from '../types/constants';
fetchMock.enableMocks();

const fixedFakeDate = new Date('2025-01-20').setHours(16);
jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('Parse Entso-E with missing day and use Elering as fallback to get prices', async () => {
  const entsoXmlResponse = readFileSync(join(`${__dirname}/../parser/`, 'mockResponse3.xml'), 'utf-8');
  const eleringJsonResponse = readFileSync(join(`${__dirname}/../parser/`, 'eleringMockResponse3.json'), 'utf-8');
  fetchMock.mockResponses(entsoXmlResponse, eleringJsonResponse);
  const nodeCache = new NodeCache();
  await rootController.updatePrices(nodeCache);

  expect(fetch).toHaveBeenNthCalledWith(
    1,
    'https://web-api.tp.entsoe.eu/api?documentType=A44&out_Domain=10YFI-1--------U&in_Domain=10YFI-1--------U&periodStart=202501180000&periodEnd=202501220000&securityToken=undefined',
    { method: 'Get' },
  );
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    'https://dashboard.elering.ee/api/nps/price?start=2025-01-17T22:00:00.000Z&end=2025-01-21T22:00:00.000Z',
    { method: 'Get' },
  );

  expect(nodeCache.get(constants.CACHED_NAME_PRICES)).toStrictEqual({
    prices: [
      {
        start: '2025-01-18T00:00:00.000+02:00',
        price: 0,
      },
      {
        start: '2025-01-18T01:00:00.000+02:00',
        price: 0,
      },
      {
        start: '2025-01-18T02:00:00.000+02:00',
        price: 0,
      },
      {
        start: '2025-01-18T03:00:00.000+02:00',
        price: 0,
      },
      {
        start: '2025-01-18T04:00:00.000+02:00',
        price: 0,
      },
      {
        start: '2025-01-18T05:00:00.000+02:00',
        price: 0.00001,
      },
      {
        start: '2025-01-18T06:00:00.000+02:00',
        price: 0.00001,
      },
      {
        start: '2025-01-18T07:00:00.000+02:00',
        price: 0.00131,
      },
      {
        start: '2025-01-18T08:00:00.000+02:00',
        price: 0.00001,
      },
      {
        start: '2025-01-18T09:00:00.000+02:00',
        price: 0.00156,
      },
      {
        start: '2025-01-18T10:00:00.000+02:00',
        price: 0.0025,
      },
      {
        start: '2025-01-18T11:00:00.000+02:00',
        price: 0.00262,
      },
      {
        start: '2025-01-18T12:00:00.000+02:00',
        price: 0.00294,
      },
      {
        start: '2025-01-18T13:00:00.000+02:00',
        price: 0.00315,
      },
      {
        start: '2025-01-18T14:00:00.000+02:00',
        price: 0.00334,
      },
      {
        start: '2025-01-18T15:00:00.000+02:00',
        price: 0.00349,
      },
      {
        start: '2025-01-18T16:00:00.000+02:00',
        price: 0.00397,
      },
      {
        start: '2025-01-18T17:00:00.000+02:00',
        price: 0.00438,
      },
      {
        start: '2025-01-18T18:00:00.000+02:00',
        price: 0.00473,
      },
      {
        start: '2025-01-18T19:00:00.000+02:00',
        price: 0.00525,
      },
      {
        start: '2025-01-18T20:00:00.000+02:00',
        price: 0.00656,
      },
      {
        start: '2025-01-18T21:00:00.000+02:00',
        price: 0.00799,
      },
      {
        start: '2025-01-18T22:00:00.000+02:00',
        price: 0.01258,
      },
      {
        start: '2025-01-18T23:00:00.000+02:00',
        price: 0.02781,
      },
      {
        start: '2025-01-19T00:00:00.000+02:00',
        price: 0.00803,
      },
      {
        start: '2025-01-19T01:00:00.000+02:00',
        price: 0.03139,
      },
      {
        start: '2025-01-19T02:00:00.000+02:00',
        price: 0.00833,
      },
      {
        start: '2025-01-19T03:00:00.000+02:00',
        price: 0.00654,
      },
      {
        start: '2025-01-19T04:00:00.000+02:00',
        price: 0.00542,
      },
      {
        start: '2025-01-19T05:00:00.000+02:00',
        price: 0.00538,
      },
      {
        start: '2025-01-19T06:00:00.000+02:00',
        price: 0.00472,
      },
      {
        start: '2025-01-19T07:00:00.000+02:00',
        price: 0.00453,
      },
      {
        start: '2025-01-19T08:00:00.000+02:00',
        price: 0.0043,
      },
      {
        start: '2025-01-19T09:00:00.000+02:00',
        price: 0.00399,
      },
      {
        start: '2025-01-19T10:00:00.000+02:00',
        price: 0.00392,
      },
      {
        start: '2025-01-19T11:00:00.000+02:00',
        price: 0.00385,
      },
      {
        start: '2025-01-19T12:00:00.000+02:00',
        price: 0.00364,
      },
      {
        start: '2025-01-19T13:00:00.000+02:00',
        price: 0.0029,
      },
      {
        start: '2025-01-19T14:00:00.000+02:00',
        price: 0.00291,
      },
      {
        start: '2025-01-19T15:00:00.000+02:00',
        price: 0.00312,
      },
      {
        start: '2025-01-19T16:00:00.000+02:00',
        price: 0.00319,
      },
      {
        start: '2025-01-19T17:00:00.000+02:00',
        price: 0.00341,
      },
      {
        start: '2025-01-19T18:00:00.000+02:00',
        price: 0.00461,
      },
      {
        start: '2025-01-19T19:00:00.000+02:00',
        price: 0.00499,
      },
      {
        start: '2025-01-19T20:00:00.000+02:00',
        price: 0.0052,
      },
      {
        start: '2025-01-19T21:00:00.000+02:00',
        price: 0.00501,
      },
      {
        start: '2025-01-19T22:00:00.000+02:00',
        price: 0.0062,
      },
      {
        start: '2025-01-19T23:00:00.000+02:00',
        price: 0.00675,
      },
      {
        start: '2025-01-20T00:00:00.000+02:00',
        price: 0.00674,
      },
      {
        start: '2025-01-20T01:00:00.000+02:00',
        price: 0.01314,
      },
      {
        start: '2025-01-20T02:00:00.000+02:00',
        price: 0.01483,
      },
      {
        start: '2025-01-20T03:00:00.000+02:00',
        price: 0.01889,
      },
      {
        start: '2025-01-20T04:00:00.000+02:00',
        price: 0.0244,
      },
      {
        start: '2025-01-20T05:00:00.000+02:00',
        price: 0.02973,
      },
      {
        start: '2025-01-20T06:00:00.000+02:00',
        price: 0.06227,
      },
      {
        start: '2025-01-20T07:00:00.000+02:00',
        price: 0.10632,
      },
      {
        start: '2025-01-20T08:00:00.000+02:00',
        price: 0.30405,
      },
      {
        start: '2025-01-20T09:00:00.000+02:00',
        price: 0.4479,
      },
      {
        start: '2025-01-20T10:00:00.000+02:00',
        price: 0.33261,
      },
      {
        start: '2025-01-20T11:00:00.000+02:00',
        price: 0.27783,
      },
      {
        start: '2025-01-20T12:00:00.000+02:00',
        price: 0.2239,
      },
      {
        start: '2025-01-20T13:00:00.000+02:00',
        price: 0.20913,
      },
      {
        start: '2025-01-20T14:00:00.000+02:00',
        price: 0.20275,
      },
      {
        start: '2025-01-20T15:00:00.000+02:00',
        price: 0.23274,
      },
      {
        start: '2025-01-20T16:00:00.000+02:00',
        price: 0.33979,
      },
      {
        start: '2025-01-20T17:00:00.000+02:00',
        price: 0.37661,
      },
      {
        start: '2025-01-20T18:00:00.000+02:00',
        price: 0.314,
      },
      {
        start: '2025-01-20T19:00:00.000+02:00',
        price: 0.21238,
      },
      {
        start: '2025-01-20T20:00:00.000+02:00',
        price: 0.19927,
      },
      {
        start: '2025-01-20T21:00:00.000+02:00',
        price: 0.08878,
      },
      {
        start: '2025-01-20T22:00:00.000+02:00',
        price: 0.10886,
      },
      {
        start: '2025-01-20T23:00:00.000+02:00',
        price: 0.06487,
      },
      {
        start: '2025-01-21T00:00:00.000+02:00',
        price: 0.03766,
      },
      {
        start: '2025-01-21T01:00:00.000+02:00',
        price: 0.03756,
      },
      {
        start: '2025-01-21T02:00:00.000+02:00',
        price: 0.04394,
      },
      {
        start: '2025-01-21T03:00:00.000+02:00',
        price: 0.04206,
      },
      {
        start: '2025-01-21T04:00:00.000+02:00',
        price: 0.03961,
      },
      {
        start: '2025-01-21T05:00:00.000+02:00',
        price: 0.04392,
      },
      {
        start: '2025-01-21T06:00:00.000+02:00',
        price: 0.05147,
      },
      {
        start: '2025-01-21T07:00:00.000+02:00',
        price: 0.06097,
      },
      {
        start: '2025-01-21T08:00:00.000+02:00',
        price: 0.13428,
      },
      {
        start: '2025-01-21T09:00:00.000+02:00',
        price: 0.16314,
      },
      {
        start: '2025-01-21T10:00:00.000+02:00',
        price: 0.12101,
      },
      {
        start: '2025-01-21T11:00:00.000+02:00',
        price: 0.12549,
      },
      {
        start: '2025-01-21T12:00:00.000+02:00',
        price: 0.08538,
      },
      {
        start: '2025-01-21T13:00:00.000+02:00',
        price: 0.08537,
      },
      {
        start: '2025-01-21T14:00:00.000+02:00',
        price: 0.07456,
      },
      {
        start: '2025-01-21T15:00:00.000+02:00',
        price: 0.06411,
      },
      {
        start: '2025-01-21T16:00:00.000+02:00',
        price: 0.06431,
      },
      {
        start: '2025-01-21T17:00:00.000+02:00',
        price: 0.05519,
      },
      {
        start: '2025-01-21T18:00:00.000+02:00',
        price: 0.04616,
      },
      {
        start: '2025-01-21T19:00:00.000+02:00',
        price: 0.03341,
      },
      {
        start: '2025-01-21T20:00:00.000+02:00',
        price: 0.01727,
      },
      {
        start: '2025-01-21T21:00:00.000+02:00',
        price: 0.0149,
      },
      {
        start: '2025-01-21T22:00:00.000+02:00',
        price: 0.01869,
      },
      {
        start: '2025-01-21T23:00:00.000+02:00',
        price: 0.02253,
      },
    ],
  });
});
