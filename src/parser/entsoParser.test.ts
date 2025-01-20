import entsoParser from '../parser/entsoParser';
import { readFileSync } from 'fs';
import { join } from 'path';
import dateUtils from '../utils/dateUtils';

const fixedFakeDate = new Date('2024-12-04');
jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('Parse Entso-E API response', async () => {
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  expect(priceRows).toStrictEqual([
    {
      start: '2024-12-02T01:00:00.000+02:00',
      price: -0.00009,
    },
    {
      start: '2024-12-02T02:00:00.000+02:00',
      price: -0.00015,
    },
    {
      start: '2024-12-02T03:00:00.000+02:00',
      price: -0.00033,
    },
    {
      start: '2024-12-02T04:00:00.000+02:00',
      price: -0.00046,
    },
    {
      start: '2024-12-02T05:00:00.000+02:00',
      price: -0.0001,
    },
    {
      start: '2024-12-02T06:00:00.000+02:00',
      price: 0.00009,
    },
    {
      start: '2024-12-02T07:00:00.000+02:00',
      price: 0.00261,
    },
    {
      start: '2024-12-02T08:00:00.000+02:00',
      price: 0.00358,
    },
    {
      start: '2024-12-02T09:00:00.000+02:00',
      price: 0.00442,
    },
    {
      start: '2024-12-02T10:00:00.000+02:00',
      price: 0.00435,
    },
    {
      start: '2024-12-02T11:00:00.000+02:00',
      price: 0.0043,
    },
    {
      start: '2024-12-02T12:00:00.000+02:00',
      price: 0.00443,
    },
    {
      start: '2024-12-02T13:00:00.000+02:00',
      price: 0.00571,
    },
    {
      start: '2024-12-02T14:00:00.000+02:00',
      price: 0.00586,
    },
    {
      start: '2024-12-02T15:00:00.000+02:00',
      price: 0.00604,
    },
    {
      start: '2024-12-02T16:00:00.000+02:00',
      price: 0.00633,
    },
    {
      start: '2024-12-02T17:00:00.000+02:00',
      price: 0.00813,
    },
    {
      start: '2024-12-02T18:00:00.000+02:00',
      price: 0.03189,
    },
    {
      start: '2024-12-02T19:00:00.000+02:00',
      price: 0.04286,
    },
    {
      start: '2024-12-02T20:00:00.000+02:00',
      price: 0.0501,
    },
    {
      start: '2024-12-02T21:00:00.000+02:00',
      price: 0.04595,
    },
    {
      start: '2024-12-02T22:00:00.000+02:00',
      price: 0.04911,
    },
    {
      start: '2024-12-02T23:00:00.000+02:00',
      price: 0.04157,
    },
    {
      start: '2024-12-03T00:00:00.000+02:00',
      price: 0.03136,
    },
    {
      start: '2024-12-03T01:00:00.000+02:00',
      price: 0.03012,
    },
    {
      start: '2024-12-03T02:00:00.000+02:00',
      price: 0.03011,
    },
    {
      start: '2024-12-03T03:00:00.000+02:00',
      price: 0.01117,
    },
    {
      start: '2024-12-03T04:00:00.000+02:00',
      price: 0.01039,
    },
    {
      start: '2024-12-03T05:00:00.000+02:00',
      price: 0.02377,
    },
    {
      start: '2024-12-03T06:00:00.000+02:00',
      price: 0.06221,
    },
    {
      start: '2024-12-03T07:00:00.000+02:00',
      price: 0.08488,
    },
    {
      start: '2024-12-03T08:00:00.000+02:00',
      price: 0.17881,
    },
    {
      start: '2024-12-03T09:00:00.000+02:00',
      price: 0.19452,
    },
    {
      start: '2024-12-03T10:00:00.000+02:00',
      price: 0.18151,
    },
    {
      start: '2024-12-03T11:00:00.000+02:00',
      price: 0.16008,
    },
    {
      start: '2024-12-03T12:00:00.000+02:00',
      price: 0.18192,
    },
    {
      start: '2024-12-03T13:00:00.000+02:00',
      price: 0.15679,
    },
    {
      start: '2024-12-03T14:00:00.000+02:00',
      price: 0.19833,
    },
    {
      start: '2024-12-03T15:00:00.000+02:00',
      price: 0.15051,
    },
    {
      start: '2024-12-03T16:00:00.000+02:00',
      price: 0.11938,
    },
    {
      start: '2024-12-03T17:00:00.000+02:00',
      price: 0.12201,
    },
    {
      start: '2024-12-03T18:00:00.000+02:00',
      price: 0.22913,
    },
    {
      start: '2024-12-03T19:00:00.000+02:00',
      price: 0.21181,
    },
    {
      start: '2024-12-03T20:00:00.000+02:00',
      price: 0.19888,
    },
    {
      start: '2024-12-03T21:00:00.000+02:00',
      price: 0.15682,
    },
    {
      start: '2024-12-03T22:00:00.000+02:00',
      price: 0.15027,
    },
    {
      start: '2024-12-03T23:00:00.000+02:00',
      price: 0.10374,
    },
    {
      start: '2024-12-04T00:00:00.000+02:00',
      price: 0.05964,
    },
    {
      start: '2024-12-04T01:00:00.000+02:00',
      price: 0.04457,
    },
    {
      start: '2024-12-04T02:00:00.000+02:00',
      price: 0.04848,
    },
    {
      start: '2024-12-04T03:00:00.000+02:00',
      price: 0.05161,
    },
    {
      start: '2024-12-04T04:00:00.000+02:00',
      price: 0.06035,
    },
    {
      start: '2024-12-04T05:00:00.000+02:00',
      price: 0.07373,
    },
    {
      start: '2024-12-04T06:00:00.000+02:00',
      price: 0.08954,
    },
    {
      start: '2024-12-04T07:00:00.000+02:00',
      price: 0.17294,
    },
    {
      start: '2024-12-04T08:00:00.000+02:00',
      price: 0.26862,
    },
    {
      start: '2024-12-04T09:00:00.000+02:00',
      price: 0.34235,
    },
    {
      start: '2024-12-04T10:00:00.000+02:00',
      price: 0.31153,
    },
    {
      start: '2024-12-04T11:00:00.000+02:00',
      price: 0.27143,
    },
    {
      start: '2024-12-04T12:00:00.000+02:00',
      price: 0.25445,
    },
    {
      start: '2024-12-04T13:00:00.000+02:00',
      price: 0.25907,
    },
    {
      start: '2024-12-04T14:00:00.000+02:00',
      price: 0.22551,
    },
    {
      start: '2024-12-04T15:00:00.000+02:00',
      price: 0.20405,
    },
    {
      start: '2024-12-04T16:00:00.000+02:00',
      price: 0.21535,
    },
    {
      start: '2024-12-04T17:00:00.000+02:00',
      price: 0.21525,
    },
    {
      start: '2024-12-04T18:00:00.000+02:00',
      price: 0.19416,
    },
    {
      start: '2024-12-04T19:00:00.000+02:00',
      price: 0.17593,
    },
    {
      start: '2024-12-04T20:00:00.000+02:00',
      price: 0.11085,
    },
    {
      start: '2024-12-04T21:00:00.000+02:00',
      price: 0.09943,
    },
    {
      start: '2024-12-04T22:00:00.000+02:00',
      price: 0.09797,
    },
    {
      start: '2024-12-04T23:00:00.000+02:00',
      price: 0.0596,
    },
    {
      start: '2024-12-05T00:00:00.000+02:00',
      price: 0.03286,
    },
    {
      start: '2024-12-05T01:00:00.000+02:00',
      price: 0.05647,
    },
    {
      start: '2024-12-05T02:00:00.000+02:00',
      price: 0.03075,
    },
    {
      start: '2024-12-05T03:00:00.000+02:00',
      price: 0.00803,
    },
    {
      start: '2024-12-05T04:00:00.000+02:00',
      price: 0.00617,
    },
    {
      start: '2024-12-05T05:00:00.000+02:00',
      price: 0.00802,
    },
    {
      start: '2024-12-05T06:00:00.000+02:00',
      price: 0.05508,
    },
    {
      start: '2024-12-05T07:00:00.000+02:00',
      price: 0.10424,
    },
    {
      start: '2024-12-05T08:00:00.000+02:00',
      price: 0.1475,
    },
    {
      start: '2024-12-05T09:00:00.000+02:00',
      price: 0.15686,
    },
    {
      start: '2024-12-05T10:00:00.000+02:00',
      price: 0.13341,
    },
    {
      start: '2024-12-05T11:00:00.000+02:00',
      price: 0.12259,
    },
    {
      start: '2024-12-05T12:00:00.000+02:00',
      price: 0.10684,
    },
    {
      start: '2024-12-05T13:00:00.000+02:00',
      price: 0.10041,
    },
    {
      start: '2024-12-05T14:00:00.000+02:00',
      price: 0.09406,
    },
    {
      start: '2024-12-05T15:00:00.000+02:00',
      price: 0.08342,
    },
    {
      start: '2024-12-05T16:00:00.000+02:00',
      price: 0.08223,
    },
    {
      start: '2024-12-05T17:00:00.000+02:00',
      price: 0.08052,
    },
    {
      start: '2024-12-05T18:00:00.000+02:00',
      price: 0.08011,
    },
    {
      start: '2024-12-05T19:00:00.000+02:00',
      price: 0.06526,
    },
    {
      start: '2024-12-05T20:00:00.000+02:00',
      price: 0.03872,
    },
    {
      start: '2024-12-05T21:00:00.000+02:00',
      price: 0.0162,
    },
    {
      start: '2024-12-05T22:00:00.000+02:00',
      price: 0.01606,
    },
    {
      start: '2024-12-05T23:00:00.000+02:00',
      price: 0.03135,
    },
    {
      start: '2024-12-06T00:00:00.000+02:00',
      price: 0.01817,
    },
  ]);
});

test('Missing periods', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2024-12-09'));
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse2.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  const yesterdayHours = dateUtils.getYesterdayHours(priceRows);
  const todayHours = dateUtils.getTodayHours(priceRows);
  const tomorrowHours = dateUtils.getTomorrowHours(priceRows);
  expect(yesterdayHours.length).toBe(24);
  expect(todayHours.length).toBe(24);
  expect(tomorrowHours.length).toBe(24);
});

test('DST summer --> winter', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2023-10-28').setHours(3));
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse_dst_winter.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  const todayHours = dateUtils.getTodayHours(priceRows);
  const tomorrowHours = dateUtils.getTomorrowHours(priceRows);
  expect(todayHours.length).toBe(23);
  expect(tomorrowHours.length).toBe(25);
  const firstHours = tomorrowHours.slice(2, 6);
  expect(firstHours).toStrictEqual([
    {
      start: '2023-10-29T02:00:00.000+03:00',
      price: 0.03412,
    },
    {
      start: '2023-10-29T03:00:00.000+03:00',
      price: 0.0318,
    },
    {
      start: '2023-10-29T03:00:00.000+02:00',
      price: 0.02805,
    },
    {
      start: '2023-10-29T04:00:00.000+02:00',
      price: 0.02654,
    },
  ]);
});

test('DST winter --> summer', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2024-03-30').setHours(3));
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse_dst_summer.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  const tomorrowHours = dateUtils.getTomorrowHours(priceRows);
  expect(tomorrowHours.length).toBe(23);
  const firstHours = tomorrowHours.slice(1, 5);
  expect(firstHours).toStrictEqual([
    {
      start: '2024-03-31T01:00:00.000+02:00',
      price: 0.05282,
    },
    {
      start: '2024-03-31T02:00:00.000+02:00',
      price: 0.05274,
    },
    {
      start: '2024-03-31T04:00:00.000+03:00',
      price: 0.05284,
    },
    {
      start: '2024-03-31T05:00:00.000+03:00',
      price: 0.05499,
    },
  ]);
});

test('Missing periods 2', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2025-01-14').setHours(15));
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse3.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  const tomorrowHours = dateUtils.getTomorrowHours(priceRows);
  console.log('Tomorrow hours = ' + JSON.stringify(tomorrowHours, null, 2));
});
