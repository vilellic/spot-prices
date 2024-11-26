import fetchMock from 'jest-fetch-mock';
import rootController from './rootController';
import NodeCache from 'node-cache';
import constants from '../types/constants';
fetchMock.enableMocks();

const fixedFakeDate = new Date('2024-11-18');
jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('Parse Elering API response store to cache and check contents', async () => {
  fetchMock.mockResponses(
    [
      JSON.stringify({
        success: true,
        data: {
          fi: [
            {
              timestamp: 1731880800,
              price: 20.21,
            },
            {
              timestamp: 1731884400,
              price: 11.57,
            },
            {
              timestamp: 1731888000,
              price: 11.52,
            },
            {
              timestamp: 1731891600,
              price: 12.14,
            },
            {
              timestamp: 1731895200,
              price: 12.48,
            },
            {
              timestamp: 1731898800,
              price: 15.88,
            },
            {
              timestamp: 1731902400,
              price: 31,
            },
            {
              timestamp: 1731906000,
              price: 52.49,
            },
            {
              timestamp: 1731909600,
              price: 79.86,
            },
            {
              timestamp: 1731913200,
              price: 101.49,
            },
            {
              timestamp: 1731916800,
              price: 95.97,
            },
            {
              timestamp: 1731920400,
              price: 79.17,
            },
            {
              timestamp: 1731924000,
              price: 74.01,
            },
            {
              timestamp: 1731927600,
              price: 70.05,
            },
            {
              timestamp: 1731931200,
              price: 63.7,
            },
            {
              timestamp: 1731934800,
              price: 70.01,
            },
            {
              timestamp: 1731938400,
              price: 85.73,
            },
            {
              timestamp: 1731942000,
              price: 99.47,
            },
            {
              timestamp: 1731945600,
              price: 116.45,
            },
            {
              timestamp: 1731949200,
              price: 146.96,
            },
            {
              timestamp: 1731952800,
              price: 137.76,
            },
            {
              timestamp: 1731956400,
              price: 97.65,
            },
            {
              timestamp: 1731960000,
              price: 85.3,
            },
            {
              timestamp: 1731963600,
              price: 87.39,
            },
          ],
        },
      }),
      { status: 200 },
    ],
    [
      JSON.stringify({
        success: true,
        data: {
          fi: [
            {
              timestamp: 1731967200,
              price: 69.46,
            },
            {
              timestamp: 1731970800,
              price: 95.15,
            },
            {
              timestamp: 1731974400,
              price: 94.75,
            },
            {
              timestamp: 1731978000,
              price: 92.27,
            },
            {
              timestamp: 1731981600,
              price: 78.95,
            },
            {
              timestamp: 1731985200,
              price: 82.55,
            },
            {
              timestamp: 1731988800,
              price: 98.28,
            },
            {
              timestamp: 1731992400,
              price: 136.61,
            },
            {
              timestamp: 1731996000,
              price: 153.64,
            },
            {
              timestamp: 1731999600,
              price: 164.23,
            },
            {
              timestamp: 1732003200,
              price: 163.09,
            },
            {
              timestamp: 1732006800,
              price: 159.71,
            },
            {
              timestamp: 1732010400,
              price: 156.18,
            },
            {
              timestamp: 1732014000,
              price: 151.95,
            },
            {
              timestamp: 1732017600,
              price: 148.28,
            },
            {
              timestamp: 1732021200,
              price: 148.32,
            },
            {
              timestamp: 1732024800,
              price: 152,
            },
            {
              timestamp: 1732028400,
              price: 174.83,
            },
            {
              timestamp: 1732032000,
              price: 151.64,
            },
            {
              timestamp: 1732035600,
              price: 140.02,
            },
            {
              timestamp: 1732039200,
              price: 130.07,
            },
            {
              timestamp: 1732042800,
              price: 115.74,
            },
            {
              timestamp: 1732046400,
              price: 93.53,
            },
            {
              timestamp: 1732050000,
              price: 76.03,
            },
          ],
        },
      }),
      { status: 200 },
    ],
    [
      JSON.stringify({
        success: true,
        data: {
          fi: [
            {
              timestamp: 1731794400,
              price: 0.01,
            },
            {
              timestamp: 1731798000,
              price: 0,
            },
            {
              timestamp: 1731801600,
              price: -0.01,
            },
            {
              timestamp: 1731805200,
              price: -0.01,
            },
            {
              timestamp: 1731808800,
              price: 0,
            },
            {
              timestamp: 1731812400,
              price: 0,
            },
            {
              timestamp: 1731816000,
              price: 0.95,
            },
            {
              timestamp: 1731819600,
              price: 2.11,
            },
            {
              timestamp: 1731823200,
              price: 4.95,
            },
            {
              timestamp: 1731826800,
              price: 6.56,
            },
            {
              timestamp: 1731830400,
              price: 8.25,
            },
            {
              timestamp: 1731834000,
              price: 9.07,
            },
            {
              timestamp: 1731837600,
              price: 9.97,
            },
            {
              timestamp: 1731841200,
              price: 10.63,
            },
            {
              timestamp: 1731844800,
              price: 19.99,
            },
            {
              timestamp: 1731848400,
              price: 31.62,
            },
            {
              timestamp: 1731852000,
              price: 51.54,
            },
            {
              timestamp: 1731855600,
              price: 54.14,
            },
            {
              timestamp: 1731859200,
              price: 56.62,
            },
            {
              timestamp: 1731862800,
              price: 55.95,
            },
            {
              timestamp: 1731866400,
              price: 52.84,
            },
            {
              timestamp: 1731870000,
              price: 45.88,
            },
            {
              timestamp: 1731873600,
              price: 45.06,
            },
            {
              timestamp: 1731877200,
              price: 32.8,
            },
          ],
        },
      }),
      { status: 200 },
    ],
  );

  const nodeCache = new NodeCache();
  await rootController.updatePrices(nodeCache);

  // today
  expect(fetch).toHaveBeenNthCalledWith(
    1,
    'https://dashboard.elering.ee/api/nps/price?start=2024-11-17T22:00:00.000Z&end=2024-11-18T21:59:59.999Z',
    { method: 'Get' },
  );

  // tomorrow
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    'https://dashboard.elering.ee/api/nps/price?start=2024-11-18T22:00:00.000Z&end=2024-11-19T21:59:59.999Z',
    { method: 'Get' },
  );

  // yesterday
  expect(fetch).toHaveBeenNthCalledWith(
    3,
    'https://dashboard.elering.ee/api/nps/price?start=2024-11-16T22:00:00.000Z&end=2024-11-17T21:59:59.999Z',
    { method: 'Get' },
  );

  expect(nodeCache.get(constants.CACHED_NAME_PRICES)).toStrictEqual({
    today: [
      {
        start: '2024-11-18T00:00:00+0200',
        price: 0.02536,
      },
      {
        start: '2024-11-18T01:00:00+0200',
        price: 0.01452,
      },
      {
        start: '2024-11-18T02:00:00+0200',
        price: 0.01446,
      },
      {
        start: '2024-11-18T03:00:00+0200',
        price: 0.01524,
      },
      {
        start: '2024-11-18T04:00:00+0200',
        price: 0.01566,
      },
      {
        start: '2024-11-18T05:00:00+0200',
        price: 0.01993,
      },
      {
        start: '2024-11-18T06:00:00+0200',
        price: 0.0389,
      },
      {
        start: '2024-11-18T07:00:00+0200',
        price: 0.06587,
      },
      {
        start: '2024-11-18T08:00:00+0200',
        price: 0.10022,
      },
      {
        start: '2024-11-18T09:00:00+0200',
        price: 0.12737,
      },
      {
        start: '2024-11-18T10:00:00+0200',
        price: 0.12044,
      },
      {
        start: '2024-11-18T11:00:00+0200',
        price: 0.09936,
      },
      {
        start: '2024-11-18T12:00:00+0200',
        price: 0.09288,
      },
      {
        start: '2024-11-18T13:00:00+0200',
        price: 0.08791,
      },
      {
        start: '2024-11-18T14:00:00+0200',
        price: 0.07994,
      },
      {
        start: '2024-11-18T15:00:00+0200',
        price: 0.08786,
      },
      {
        start: '2024-11-18T16:00:00+0200',
        price: 0.10759,
      },
      {
        start: '2024-11-18T17:00:00+0200',
        price: 0.12483,
      },
      {
        start: '2024-11-18T18:00:00+0200',
        price: 0.14614,
      },
      {
        start: '2024-11-18T19:00:00+0200',
        price: 0.18443,
      },
      {
        start: '2024-11-18T20:00:00+0200',
        price: 0.17289,
      },
      {
        start: '2024-11-18T21:00:00+0200',
        price: 0.12255,
      },
      {
        start: '2024-11-18T22:00:00+0200',
        price: 0.10705,
      },
      {
        start: '2024-11-18T23:00:00+0200',
        price: 0.10967,
      },
    ],
    tomorrow: [
      {
        start: '2024-11-19T00:00:00+0200',
        price: 0.08717,
      },
      {
        start: '2024-11-19T01:00:00+0200',
        price: 0.11941,
      },
      {
        start: '2024-11-19T02:00:00+0200',
        price: 0.11891,
      },
      {
        start: '2024-11-19T03:00:00+0200',
        price: 0.1158,
      },
      {
        start: '2024-11-19T04:00:00+0200',
        price: 0.09908,
      },
      {
        start: '2024-11-19T05:00:00+0200',
        price: 0.1036,
      },
      {
        start: '2024-11-19T06:00:00+0200',
        price: 0.12334,
      },
      {
        start: '2024-11-19T07:00:00+0200',
        price: 0.17145,
      },
      {
        start: '2024-11-19T08:00:00+0200',
        price: 0.19282,
      },
      {
        start: '2024-11-19T09:00:00+0200',
        price: 0.20611,
      },
      {
        start: '2024-11-19T10:00:00+0200',
        price: 0.20468,
      },
      {
        start: '2024-11-19T11:00:00+0200',
        price: 0.20044,
      },
      {
        start: '2024-11-19T12:00:00+0200',
        price: 0.19601,
      },
      {
        start: '2024-11-19T13:00:00+0200',
        price: 0.1907,
      },
      {
        start: '2024-11-19T14:00:00+0200',
        price: 0.18609,
      },
      {
        start: '2024-11-19T15:00:00+0200',
        price: 0.18614,
      },
      {
        start: '2024-11-19T16:00:00+0200',
        price: 0.19076,
      },
      {
        start: '2024-11-19T17:00:00+0200',
        price: 0.21941,
      },
      {
        start: '2024-11-19T18:00:00+0200',
        price: 0.19031,
      },
      {
        start: '2024-11-19T19:00:00+0200',
        price: 0.17573,
      },
      {
        start: '2024-11-19T20:00:00+0200',
        price: 0.16324,
      },
      {
        start: '2024-11-19T21:00:00+0200',
        price: 0.14525,
      },
      {
        start: '2024-11-19T22:00:00+0200',
        price: 0.11738,
      },
      {
        start: '2024-11-19T23:00:00+0200',
        price: 0.09542,
      },
    ],
    yesterday: [
      {
        start: '2024-11-17T00:00:00+0200',
        price: 0.00001,
      },
      {
        start: '2024-11-17T01:00:00+0200',
        price: 0,
      },
      {
        start: '2024-11-17T02:00:00+0200',
        price: -0.00001,
      },
      {
        start: '2024-11-17T03:00:00+0200',
        price: -0.00001,
      },
      {
        start: '2024-11-17T04:00:00+0200',
        price: 0,
      },
      {
        start: '2024-11-17T05:00:00+0200',
        price: 0,
      },
      {
        start: '2024-11-17T06:00:00+0200',
        price: 0.00119,
      },
      {
        start: '2024-11-17T07:00:00+0200',
        price: 0.00265,
      },
      {
        start: '2024-11-17T08:00:00+0200',
        price: 0.00621,
      },
      {
        start: '2024-11-17T09:00:00+0200',
        price: 0.00823,
      },
      {
        start: '2024-11-17T10:00:00+0200',
        price: 0.01035,
      },
      {
        start: '2024-11-17T11:00:00+0200',
        price: 0.01138,
      },
      {
        start: '2024-11-17T12:00:00+0200',
        price: 0.01251,
      },
      {
        start: '2024-11-17T13:00:00+0200',
        price: 0.01334,
      },
      {
        start: '2024-11-17T14:00:00+0200',
        price: 0.02509,
      },
      {
        start: '2024-11-17T15:00:00+0200',
        price: 0.03968,
      },
      {
        start: '2024-11-17T16:00:00+0200',
        price: 0.06468,
      },
      {
        start: '2024-11-17T17:00:00+0200',
        price: 0.06795,
      },
      {
        start: '2024-11-17T18:00:00+0200',
        price: 0.07106,
      },
      {
        start: '2024-11-17T19:00:00+0200',
        price: 0.07022,
      },
      {
        start: '2024-11-17T20:00:00+0200',
        price: 0.06631,
      },
      {
        start: '2024-11-17T21:00:00+0200',
        price: 0.05758,
      },
      {
        start: '2024-11-17T22:00:00+0200',
        price: 0.05655,
      },
      {
        start: '2024-11-17T23:00:00+0200',
        price: 0.04116,
      },
    ],
  });

  expect(await rootController.handleRoot({ cache: nodeCache })).toStrictEqual({
    info: {
      current: '0.01446',
      averageToday: '0.08671',
      averageTodayOffPeak: '0.02686',
      averageTodayPeak: '0.11469',
      tomorrowAvailable: true,
      averageTomorrow: '0.15830',
      averageTomorrowOffPeak: '0.10934',
      averageTomorrowPeak: '0.18794',
    },
    today: [
      {
        start: '2024-11-18T00:00:00+0200',
        price: '0.02536',
      },
      {
        start: '2024-11-18T01:00:00+0200',
        price: '0.01452',
      },
      {
        start: '2024-11-18T02:00:00+0200',
        price: '0.01446',
      },
      {
        start: '2024-11-18T03:00:00+0200',
        price: '0.01524',
      },
      {
        start: '2024-11-18T04:00:00+0200',
        price: '0.01566',
      },
      {
        start: '2024-11-18T05:00:00+0200',
        price: '0.01993',
      },
      {
        start: '2024-11-18T06:00:00+0200',
        price: '0.03890',
      },
      {
        start: '2024-11-18T07:00:00+0200',
        price: '0.06587',
      },
      {
        start: '2024-11-18T08:00:00+0200',
        price: '0.10022',
      },
      {
        start: '2024-11-18T09:00:00+0200',
        price: '0.12737',
      },
      {
        start: '2024-11-18T10:00:00+0200',
        price: '0.12044',
      },
      {
        start: '2024-11-18T11:00:00+0200',
        price: '0.09936',
      },
      {
        start: '2024-11-18T12:00:00+0200',
        price: '0.09288',
      },
      {
        start: '2024-11-18T13:00:00+0200',
        price: '0.08791',
      },
      {
        start: '2024-11-18T14:00:00+0200',
        price: '0.07994',
      },
      {
        start: '2024-11-18T15:00:00+0200',
        price: '0.08786',
      },
      {
        start: '2024-11-18T16:00:00+0200',
        price: '0.10759',
      },
      {
        start: '2024-11-18T17:00:00+0200',
        price: '0.12483',
      },
      {
        start: '2024-11-18T18:00:00+0200',
        price: '0.14614',
      },
      {
        start: '2024-11-18T19:00:00+0200',
        price: '0.18443',
      },
      {
        start: '2024-11-18T20:00:00+0200',
        price: '0.17289',
      },
      {
        start: '2024-11-18T21:00:00+0200',
        price: '0.12255',
      },
      {
        start: '2024-11-18T22:00:00+0200',
        price: '0.10705',
      },
      {
        start: '2024-11-18T23:00:00+0200',
        price: '0.10967',
      },
    ],
    tomorrow: [
      {
        start: '2024-11-19T00:00:00+0200',
        price: '0.08717',
      },
      {
        start: '2024-11-19T01:00:00+0200',
        price: '0.11941',
      },
      {
        start: '2024-11-19T02:00:00+0200',
        price: '0.11891',
      },
      {
        start: '2024-11-19T03:00:00+0200',
        price: '0.11580',
      },
      {
        start: '2024-11-19T04:00:00+0200',
        price: '0.09908',
      },
      {
        start: '2024-11-19T05:00:00+0200',
        price: '0.10360',
      },
      {
        start: '2024-11-19T06:00:00+0200',
        price: '0.12334',
      },
      {
        start: '2024-11-19T07:00:00+0200',
        price: '0.17145',
      },
      {
        start: '2024-11-19T08:00:00+0200',
        price: '0.19282',
      },
      {
        start: '2024-11-19T09:00:00+0200',
        price: '0.20611',
      },
      {
        start: '2024-11-19T10:00:00+0200',
        price: '0.20468',
      },
      {
        start: '2024-11-19T11:00:00+0200',
        price: '0.20044',
      },
      {
        start: '2024-11-19T12:00:00+0200',
        price: '0.19601',
      },
      {
        start: '2024-11-19T13:00:00+0200',
        price: '0.19070',
      },
      {
        start: '2024-11-19T14:00:00+0200',
        price: '0.18609',
      },
      {
        start: '2024-11-19T15:00:00+0200',
        price: '0.18614',
      },
      {
        start: '2024-11-19T16:00:00+0200',
        price: '0.19076',
      },
      {
        start: '2024-11-19T17:00:00+0200',
        price: '0.21941',
      },
      {
        start: '2024-11-19T18:00:00+0200',
        price: '0.19031',
      },
      {
        start: '2024-11-19T19:00:00+0200',
        price: '0.17573',
      },
      {
        start: '2024-11-19T20:00:00+0200',
        price: '0.16324',
      },
      {
        start: '2024-11-19T21:00:00+0200',
        price: '0.14525',
      },
      {
        start: '2024-11-19T22:00:00+0200',
        price: '0.11738',
      },
      {
        start: '2024-11-19T23:00:00+0200',
        price: '0.09542',
      },
    ],
  });
});
