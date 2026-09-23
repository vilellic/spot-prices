import { parseNordpoolResponse, NordpoolResponse } from './nordpoolProvider';
import { readFileSync } from 'fs';
import { join } from 'path';

test('Parse Nordpool response into PriceRow array', () => {
  const json = JSON.parse(
    readFileSync(join(`${__dirname}/../parser/`, 'nordpoolMockResponse.json'), 'utf-8'),
  ) as NordpoolResponse;

  const prices = parseNordpoolResponse(json);

  expect(prices).toHaveLength(8);

  // First entry: 1.39 EUR/MWh → getPrice converts to EUR/kWh with VAT
  // getPrice(1.39) = (1.39 / 1000) * 1.255 = 0.00174 (rounded to 5 decimals)
  expect(prices[0].price).toBe(0.00174);
  expect(prices[0].start).toContain('2026-04-22T01:00:00'); // UTC 22:00 → Helsinki +3h = 01:00

  // Negative price: 0.02 EUR/MWh → small positive
  // getPrice(0.02) = (0.02 / 1000) * 1.255 = 0.00003
  expect(prices[7].price).toBeCloseTo(0.00003, 5);
});

test('Parse empty Nordpool response returns empty array', () => {
  const emptyResponse: NordpoolResponse = {
    deliveryDateCET: '2026-04-22',
    version: 3,
    updatedAt: '2026-04-21T11:28:52Z',
    deliveryAreas: ['FI'],
    market: 'DayAhead',
    multiAreaEntries: [],
    currency: 'EUR',
    exchangeRate: 1,
    areaAverages: [],
  };

  const prices = parseNordpoolResponse(emptyResponse);
  expect(prices).toHaveLength(0);
});

test('Parse Nordpool response with negative prices', () => {
  const response: NordpoolResponse = {
    deliveryDateCET: '2026-04-22',
    version: 3,
    updatedAt: '2026-04-21T11:28:52Z',
    deliveryAreas: ['FI'],
    market: 'DayAhead',
    multiAreaEntries: [
      {
        deliveryStart: '2026-04-21T22:00:00Z',
        deliveryEnd: '2026-04-21T22:15:00Z',
        entryPerArea: { FI: -0.5 },
      },
    ],
    currency: 'EUR',
    exchangeRate: 1,
    areaAverages: [],
  };

  const prices = parseNordpoolResponse(response);
  expect(prices).toHaveLength(1);
  // Negative price: no VAT applied, just divided by 1000
  // getPrice(-0.5) = (-0.5 / 1000) * 1 = -0.0005
  expect(prices[0].price).toBeCloseTo(-0.0005, 5);
});
