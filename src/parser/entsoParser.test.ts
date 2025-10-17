import entsoParser from '../parser/entsoParser';
import { readFileSync } from 'fs';
import { join } from 'path';
import dateUtils from '../utils/dateUtils';

const fixedFakeDate = new Date('2024-12-04');
jest.useFakeTimers().setSystemTime(fixedFakeDate);

// Helper: reduce quarter-hour rows into hourly rows by taking the first slot of each hour
function toHourly(rows: { start: string; price: number }[]) {
  return rows.filter((_, idx) => idx % 4 === 0);
}

function expectHourlySubsetPresent(
  allRows: { start: string; price: number }[],
  expectedHourly: { start: string; price: number }[],
) {
  const map = new Map(allRows.map((r) => [r.start, r.price]));
  expectedHourly.forEach((exp) => {
    expect(map.has(exp.start)).toBeTruthy();
    expect(map.get(exp.start)).toBe(exp.price);
  });
}

test('Parse Entso-E API response (hourly expectations within quarter-hour data)', async () => {
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  // 4 TimeSeries * 24h * 4 quarter-hours
  expect(priceRows.length).toBe(4 * 24 * 4);

  const expectedHourly = [
    { start: '2024-12-02T01:00:00.000+02:00', price: -0.00009 },
    { start: '2024-12-02T02:00:00.000+02:00', price: -0.00015 },
    { start: '2024-12-02T03:00:00.000+02:00', price: -0.00033 },
    { start: '2024-12-02T04:00:00.000+02:00', price: -0.00046 },
    { start: '2024-12-02T05:00:00.000+02:00', price: -0.0001 },
    { start: '2024-12-02T06:00:00.000+02:00', price: 0.00009 },
    { start: '2024-12-02T07:00:00.000+02:00', price: 0.00261 },
    { start: '2024-12-02T08:00:00.000+02:00', price: 0.00358 },
    { start: '2024-12-02T09:00:00.000+02:00', price: 0.00442 },
    { start: '2024-12-02T10:00:00.000+02:00', price: 0.00435 },
    { start: '2024-12-02T11:00:00.000+02:00', price: 0.0043 },
    { start: '2024-12-02T12:00:00.000+02:00', price: 0.00443 },
    { start: '2024-12-02T13:00:00.000+02:00', price: 0.00571 },
    { start: '2024-12-02T14:00:00.000+02:00', price: 0.00586 },
  ];
  expectHourlySubsetPresent(priceRows, expectedHourly);
});

test('Parse Entso-E API response, PT15M (full 96 quarter-hours, spot check)', async () => {
  const pt15mfixedFakeDate = new Date('2025-10-17');
  jest.useFakeTimers().setSystemTime(pt15mfixedFakeDate);
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse_pt15m.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  expect(priceRows.length).toBe(96);

  // A few random spot checks later in the day
  const sampleExpectations = [
    { start: '2025-10-17T06:30:00.000+03:00', price: 0.17537 },
    { start: '2025-10-17T08:30:00.000+03:00', price: 0.3764 },
    { start: '2025-10-17T12:00:00.000+03:00', price: 0.22119 },
    { start: '2025-10-17T17:30:00.000+03:00', price: 0.20719 },
    { start: '2025-10-17T23:45:00.000+03:00', price: 0.10401 },
  ];
  const map = new Map(priceRows.map((r) => [r.start, r.price]));
  sampleExpectations.forEach((s) => {
    expect(map.get(s.start)).toBeCloseTo(s.price, 5);
  });
});

test('Missing periods (quarter-hour counts)', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2024-12-09'));
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse2.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  const yesterday = dateUtils.getYesterdayTimeSlots(priceRows);
  const today = dateUtils.getTodayTimeSlots(priceRows);
  const tomorrow = dateUtils.getTomorrowTimeSlots(priceRows);
  expect(yesterday.length).toBe(96);
  expect(today.length).toBe(96);
  expect(tomorrow.length).toBe(96);
});

test('DST summer --> winter (23h / 25h days in quarter-hours)', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2023-10-28').setHours(3));
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse_dst_winter.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  const todaySlots = dateUtils.getTodayTimeSlots(priceRows); // day before change -> 23h = 92 slots
  const tomorrowSlots = dateUtils.getTomorrowTimeSlots(priceRows); // day of change -> 25h = 100 slots
  expect(todaySlots.length).toBe(92);
  expect(tomorrowSlots.length).toBe(100);

  // Build hourly snapshots
  const tomorrowHourly = toHourly(tomorrowSlots);
  // Extract a representative sequence (skip first two hours like original logic but adapted)
  const subset = [tomorrowHourly[2], tomorrowHourly[3], tomorrowHourly[4], tomorrowHourly[5]];
  expect(subset).toStrictEqual([
    { start: '2023-10-29T02:00:00.000+03:00', price: 0.03412 },
    { start: '2023-10-29T03:00:00.000+03:00', price: 0.0318 },
    { start: '2023-10-29T03:00:00.000+02:00', price: 0.02805 },
    { start: '2023-10-29T04:00:00.000+02:00', price: 0.02654 },
  ]);
});

test('DST winter --> summer (lost hour -> 23h day)', async () => {
  jest.useFakeTimers().setSystemTime(new Date('2024-03-30').setHours(3));
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse_dst_summer.xml'), 'utf-8');
  const priceRows = entsoParser.parseXML(xmlResponse);
  const tomorrowSlots = dateUtils.getTomorrowTimeSlots(priceRows); // 23h = 92 slots
  expect(tomorrowSlots.length).toBe(92);
  const tomorrowHourly = toHourly(tomorrowSlots);
  const subset = [tomorrowHourly[1], tomorrowHourly[2], tomorrowHourly[3], tomorrowHourly[4]];
  expect(subset).toStrictEqual([
    { start: '2024-03-31T01:00:00.000+02:00', price: 0.05282 },
    { start: '2024-03-31T02:00:00.000+02:00', price: 0.05274 },
    { start: '2024-03-31T04:00:00.000+03:00', price: 0.05284 },
    { start: '2024-03-31T05:00:00.000+03:00', price: 0.05499 },
  ]);
});
