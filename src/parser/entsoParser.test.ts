import entsoParser from '../parser/entsoParser';
import { readFileSync } from 'fs';
import { join } from 'path';

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
  expect(priceRows.length).toBe(576);

  const expectedHourly = [
    { start: '2025-10-16T01:00:00.000+03:00', price: -0.0001 },
    { start: '2025-10-16T03:00:00.000+03:00', price: -0.00009 },
    { start: '2025-10-16T09:00:00.000+03:00', price: 0.00709 },
    { start: '2025-10-16T21:30:00.000+03:00', price: 0.04751 },
    { start: '2025-10-16T23:45:00.000+03:00', price: 0.02932 },
    { start: '2025-10-17T00:00:00.000+03:00', price: 0.03858 },
  ];
  expectHourlySubsetPresent(priceRows, expectedHourly);
});

test('Parse Entso-E API response, PT15M (full 96 quarter-hours, spot check)', async () => {
  const pt15mfixedFakeDate = new Date('2025-10-17');
  jest.useFakeTimers().setSystemTime(pt15mfixedFakeDate);
  const xmlResponse = readFileSync(join(__dirname, 'mockResponse2.xml'), 'utf-8');
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

test('skips a period without points and continues parsing valid periods', () => {
  const xmlResponse = `
    <Publication_MarketDocument>
      <TimeSeries>
        <Period>
          <timeInterval>
            <start>2025-10-17T00:00Z</start>
            <end>2025-10-17T01:00Z</end>
          </timeInterval>
          <resolution>PT60M</resolution>
        </Period>
        <Period>
          <timeInterval>
            <start>2025-10-17T01:00Z</start>
            <end>2025-10-17T02:00Z</end>
          </timeInterval>
          <resolution>PT60M</resolution>
          <Point>
            <position>1</position>
            <price.amount>10</price.amount>
          </Point>
        </Period>
      </TimeSeries>
    </Publication_MarketDocument>`;

  const priceRows = entsoParser.parseXML(xmlResponse);

  expect(priceRows).toHaveLength(4);
  expect(priceRows.every((row) => row.price === 0.01255)).toBe(true);
});
