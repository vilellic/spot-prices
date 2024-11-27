import fetchMock from 'jest-fetch-mock';
import rootController from './rootController';
import NodeCache from 'node-cache';
import constants from '../types/constants';
fetchMock.enableMocks();

const fixedFakeDate = new Date('2024-11-27');
jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('Parse Elering API response store to cache and check contents', async () => {
  fetchMock.mockResponse(
    JSON.stringify({
      success: true,
      data: {
        fi: [
          {
            timestamp: 1732572000,
            price: 1.64,
          },
          {
            timestamp: 1732575600,
            price: 0.01,
          },
          {
            timestamp: 1732579200,
            price: -0.01,
          },
          {
            timestamp: 1732582800,
            price: 0,
          },
          {
            timestamp: 1732586400,
            price: -0.01,
          },
          {
            timestamp: 1732590000,
            price: 0,
          },
          {
            timestamp: 1732593600,
            price: 2.02,
          },
          {
            timestamp: 1732597200,
            price: 5.16,
          },
          {
            timestamp: 1732600800,
            price: 6.39,
          },
          {
            timestamp: 1732604400,
            price: 8.38,
          },
          {
            timestamp: 1732608000,
            price: 8.94,
          },
          {
            timestamp: 1732611600,
            price: 11.72,
          },
          {
            timestamp: 1732615200,
            price: 15.26,
          },
          {
            timestamp: 1732618800,
            price: 14.62,
          },
          {
            timestamp: 1732622400,
            price: 16.39,
          },
          {
            timestamp: 1732626000,
            price: 18.84,
          },
          {
            timestamp: 1732629600,
            price: 25.13,
          },
          {
            timestamp: 1732633200,
            price: 32.79,
          },
          {
            timestamp: 1732636800,
            price: 41.27,
          },
          {
            timestamp: 1732640400,
            price: 43.99,
          },
          {
            timestamp: 1732644000,
            price: 38.98,
          },
          {
            timestamp: 1732647600,
            price: 35.09,
          },
          {
            timestamp: 1732651200,
            price: 40.81,
          },
          {
            timestamp: 1732654800,
            price: 32.93,
          },
          {
            timestamp: 1732658400,
            price: 27.8,
          },
          {
            timestamp: 1732662000,
            price: 35.84,
          },
          {
            timestamp: 1732665600,
            price: 33.04,
          },
          {
            timestamp: 1732669200,
            price: 34.56,
          },
          {
            timestamp: 1732672800,
            price: 36.86,
          },
          {
            timestamp: 1732676400,
            price: 42.04,
          },
          {
            timestamp: 1732680000,
            price: 63.98,
          },
          {
            timestamp: 1732683600,
            price: 171.04,
          },
          {
            timestamp: 1732687200,
            price: 186.07,
          },
          {
            timestamp: 1732690800,
            price: 189.99,
          },
          {
            timestamp: 1732694400,
            price: 175.69,
          },
          {
            timestamp: 1732698000,
            price: 160.83,
          },
          {
            timestamp: 1732701600,
            price: 160.57,
          },
          {
            timestamp: 1732705200,
            price: 159.28,
          },
          {
            timestamp: 1732708800,
            price: 156.08,
          },
          {
            timestamp: 1732712400,
            price: 156.07,
          },
          {
            timestamp: 1732716000,
            price: 199.99,
          },
          {
            timestamp: 1732719600,
            price: 200.06,
          },
          {
            timestamp: 1732723200,
            price: 166.34,
          },
          {
            timestamp: 1732726800,
            price: 123.72,
          },
          {
            timestamp: 1732730400,
            price: 111.56,
          },
          {
            timestamp: 1732734000,
            price: 85.01,
          },
          {
            timestamp: 1732737600,
            price: 78.05,
          },
          {
            timestamp: 1732741200,
            price: 72.35,
          },
          {
            timestamp: 1732744800,
            price: 55.03,
          },
          {
            timestamp: 1732748400,
            price: 55.23,
          },
          {
            timestamp: 1732752000,
            price: 47.13,
          },
          {
            timestamp: 1732755600,
            price: 35.99,
          },
          {
            timestamp: 1732759200,
            price: 34.57,
          },
          {
            timestamp: 1732762800,
            price: 40.48,
          },
          {
            timestamp: 1732766400,
            price: 53.64,
          },
          {
            timestamp: 1732770000,
            price: 129.94,
          },
          {
            timestamp: 1732773600,
            price: 144.08,
          },
          {
            timestamp: 1732777200,
            price: 144.04,
          },
          {
            timestamp: 1732780800,
            price: 144.09,
          },
          {
            timestamp: 1732784400,
            price: 144.09,
          },
          {
            timestamp: 1732788000,
            price: 162.01,
          },
          {
            timestamp: 1732791600,
            price: 162.58,
          },
          {
            timestamp: 1732795200,
            price: 169.14,
          },
          {
            timestamp: 1732798800,
            price: 157.67,
          },
          {
            timestamp: 1732802400,
            price: 173.48,
          },
          {
            timestamp: 1732806000,
            price: 159.09,
          },
          {
            timestamp: 1732809600,
            price: 175.98,
          },
          {
            timestamp: 1732813200,
            price: 164.93,
          },
          {
            timestamp: 1732816800,
            price: 160.48,
          },
          {
            timestamp: 1732820400,
            price: 144.1,
          },
          {
            timestamp: 1732824000,
            price: 132.21,
          },
          {
            timestamp: 1732827600,
            price: 113.4,
          },
        ],
      },
    }),
    { status: 200 },
  );

  const nodeCache = new NodeCache();
  await rootController.updatePrices(nodeCache);

  // today
  expect(fetch).toHaveBeenNthCalledWith(
    1,
    'https://dashboard.elering.ee/api/nps/price?start=2024-11-25T22:00:00.000Z&end=2024-11-28T21:59:59.999Z',
    { method: 'Get' },
  );

  console.log(JSON.stringify(nodeCache.get(constants.CACHED_NAME_PRICES), null, 2))

  expect(nodeCache.get(constants.CACHED_NAME_PRICES)).toStrictEqual({
    "prices": [
      {
        "start": "2024-11-26T01:00:00+0300",
        "price": 0.00206
      },
      {
        "start": "2024-11-26T02:00:00+0300",
        "price": 0.00001
      },
      {
        "start": "2024-11-26T03:00:00+0300",
        "price": -0.00001
      },
      {
        "start": "2024-11-26T04:00:00+0300",
        "price": 0
      },
      {
        "start": "2024-11-26T05:00:00+0300",
        "price": -0.00001
      },
      {
        "start": "2024-11-26T06:00:00+0300",
        "price": 0
      },
      {
        "start": "2024-11-26T07:00:00+0300",
        "price": 0.00254
      },
      {
        "start": "2024-11-26T08:00:00+0300",
        "price": 0.00648
      },
      {
        "start": "2024-11-26T09:00:00+0300",
        "price": 0.00802
      },
      {
        "start": "2024-11-26T10:00:00+0300",
        "price": 0.01052
      },
      {
        "start": "2024-11-26T11:00:00+0300",
        "price": 0.01122
      },
      {
        "start": "2024-11-26T12:00:00+0300",
        "price": 0.01471
      },
      {
        "start": "2024-11-26T13:00:00+0300",
        "price": 0.01915
      },
      {
        "start": "2024-11-26T14:00:00+0300",
        "price": 0.01835
      },
      {
        "start": "2024-11-26T15:00:00+0300",
        "price": 0.02057
      },
      {
        "start": "2024-11-26T16:00:00+0300",
        "price": 0.02364
      },
      {
        "start": "2024-11-26T17:00:00+0300",
        "price": 0.03154
      },
      {
        "start": "2024-11-26T18:00:00+0300",
        "price": 0.04115
      },
      {
        "start": "2024-11-26T19:00:00+0300",
        "price": 0.05179
      },
      {
        "start": "2024-11-26T20:00:00+0300",
        "price": 0.05521
      },
      {
        "start": "2024-11-26T21:00:00+0300",
        "price": 0.04892
      },
      {
        "start": "2024-11-26T22:00:00+0300",
        "price": 0.04404
      },
      {
        "start": "2024-11-26T23:00:00+0300",
        "price": 0.05122
      },
      {
        "start": "2024-11-27T00:00:00+0300",
        "price": 0.04133
      },
      {
        "start": "2024-11-27T01:00:00+0300",
        "price": 0.03489
      },
      {
        "start": "2024-11-27T02:00:00+0300",
        "price": 0.04498
      },
      {
        "start": "2024-11-27T03:00:00+0300",
        "price": 0.04147
      },
      {
        "start": "2024-11-27T04:00:00+0300",
        "price": 0.04337
      },
      {
        "start": "2024-11-27T05:00:00+0300",
        "price": 0.04626
      },
      {
        "start": "2024-11-27T06:00:00+0300",
        "price": 0.05276
      },
      {
        "start": "2024-11-27T07:00:00+0300",
        "price": 0.08029
      },
      {
        "start": "2024-11-27T08:00:00+0300",
        "price": 0.21466
      },
      {
        "start": "2024-11-27T09:00:00+0300",
        "price": 0.23352
      },
      {
        "start": "2024-11-27T10:00:00+0300",
        "price": 0.23844
      },
      {
        "start": "2024-11-27T11:00:00+0300",
        "price": 0.22049
      },
      {
        "start": "2024-11-27T12:00:00+0300",
        "price": 0.20184
      },
      {
        "start": "2024-11-27T13:00:00+0300",
        "price": 0.20152
      },
      {
        "start": "2024-11-27T14:00:00+0300",
        "price": 0.1999
      },
      {
        "start": "2024-11-27T15:00:00+0300",
        "price": 0.19588
      },
      {
        "start": "2024-11-27T16:00:00+0300",
        "price": 0.19587
      },
      {
        "start": "2024-11-27T17:00:00+0300",
        "price": 0.25099
      },
      {
        "start": "2024-11-27T18:00:00+0300",
        "price": 0.25108
      },
      {
        "start": "2024-11-27T19:00:00+0300",
        "price": 0.20876
      },
      {
        "start": "2024-11-27T20:00:00+0300",
        "price": 0.15527
      },
      {
        "start": "2024-11-27T21:00:00+0300",
        "price": 0.14001
      },
      {
        "start": "2024-11-27T22:00:00+0300",
        "price": 0.10669
      },
      {
        "start": "2024-11-27T23:00:00+0300",
        "price": 0.09795
      },
      {
        "start": "2024-11-28T00:00:00+0300",
        "price": 0.0908
      },
      {
        "start": "2024-11-28T01:00:00+0300",
        "price": 0.06906
      },
      {
        "start": "2024-11-28T02:00:00+0300",
        "price": 0.06931
      },
      {
        "start": "2024-11-28T03:00:00+0300",
        "price": 0.05915
      },
      {
        "start": "2024-11-28T04:00:00+0300",
        "price": 0.04517
      },
      {
        "start": "2024-11-28T05:00:00+0300",
        "price": 0.04339
      },
      {
        "start": "2024-11-28T06:00:00+0300",
        "price": 0.0508
      },
      {
        "start": "2024-11-28T07:00:00+0300",
        "price": 0.06732
      },
      {
        "start": "2024-11-28T08:00:00+0300",
        "price": 0.16307
      },
      {
        "start": "2024-11-28T09:00:00+0300",
        "price": 0.18082
      },
      {
        "start": "2024-11-28T10:00:00+0300",
        "price": 0.18077
      },
      {
        "start": "2024-11-28T11:00:00+0300",
        "price": 0.18083
      },
      {
        "start": "2024-11-28T12:00:00+0300",
        "price": 0.18083
      },
      {
        "start": "2024-11-28T13:00:00+0300",
        "price": 0.20332
      },
      {
        "start": "2024-11-28T14:00:00+0300",
        "price": 0.20404
      },
      {
        "start": "2024-11-28T15:00:00+0300",
        "price": 0.21227
      },
      {
        "start": "2024-11-28T16:00:00+0300",
        "price": 0.19788
      },
      {
        "start": "2024-11-28T17:00:00+0300",
        "price": 0.21772
      },
      {
        "start": "2024-11-28T18:00:00+0300",
        "price": 0.19966
      },
      {
        "start": "2024-11-28T19:00:00+0300",
        "price": 0.22085
      },
      {
        "start": "2024-11-28T20:00:00+0300",
        "price": 0.20699
      },
      {
        "start": "2024-11-28T21:00:00+0300",
        "price": 0.2014
      },
      {
        "start": "2024-11-28T22:00:00+0300",
        "price": 0.18085
      },
      {
        "start": "2024-11-28T23:00:00+0300",
        "price": 0.16592
      },
      {
        "start": "2024-11-29T00:00:00+0300",
        "price": 0.14232
      }
    ]
  });

  console.log(JSON.stringify(await rootController.handleRoot({ cache: nodeCache }), null, 2))

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
