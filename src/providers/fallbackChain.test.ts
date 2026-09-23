import { executeFallbackChain } from './fallbackChain';
import { SpotPriceProvider } from './spotPriceProvider';
import { PriceRow } from '../types/types';
import { DateTime } from 'luxon';

// Use a fixed date so checkArePricesMissing works deterministically
const fixedFakeDate = new Date('2025-10-18').setHours(10);
jest.useFakeTimers().setSystemTime(fixedFakeDate);

const start = DateTime.fromISO('2025-10-16T00:00:00+03:00');
const end = DateTime.fromISO('2025-10-20T00:00:00+03:00');

function generatePricesForDay(dateStr: string): PriceRow[] {
  const prices: PriceRow[] = [];
  const base = DateTime.fromISO(`${dateStr}T00:00:00.000+03:00`);
  for (let i = 0; i < 96; i++) {
    prices.push({
      start: base.plus({ minutes: i * 15 }).toISO()!,
      price: 0.01,
    });
  }
  return prices;
}

const fullData: PriceRow[] = [
  ...generatePricesForDay('2025-10-17'),
  ...generatePricesForDay('2025-10-18'),
  ...generatePricesForDay('2025-10-19'),
];

function createMockProvider(name: string, prices: PriceRow[], available = true): SpotPriceProvider {
  return {
    name,
    isAvailable: () => available,
    fetchPrices: jest.fn().mockResolvedValue(prices),
  };
}

test('Uses first provider when it returns complete data', async () => {
  const providerA = createMockProvider('A', fullData);
  const providerB = createMockProvider('B', fullData);

  const result = await executeFallbackChain([providerA, providerB], [], start, end);

  expect(result.complete).toBe(true);
  expect(result.providersUsed).toEqual(['A']);
  expect(providerA.fetchPrices).toHaveBeenCalledTimes(1);
  expect(providerB.fetchPrices).not.toHaveBeenCalled();
});

test('Falls through to second provider when first fails', async () => {
  const providerA = createMockProvider('A', []);
  const providerB = createMockProvider('B', fullData);

  const result = await executeFallbackChain([providerA, providerB], [], start, end);

  expect(result.complete).toBe(true);
  expect(result.providersUsed).toEqual(['B']);
});

test('Falls through to second provider when first throws', async () => {
  const providerA: SpotPriceProvider = {
    name: 'A',
    isAvailable: () => true,
    fetchPrices: jest.fn().mockRejectedValue(new Error('Network error')),
  };
  const providerB = createMockProvider('B', fullData);

  const result = await executeFallbackChain([providerA, providerB], [], start, end);

  expect(result.complete).toBe(true);
  expect(result.providersUsed).toEqual(['B']);
});

test('Merges partial data from multiple providers', async () => {
  const partialA = generatePricesForDay('2025-10-17');
  const partialB = [...generatePricesForDay('2025-10-18'), ...generatePricesForDay('2025-10-19')];
  const providerA = createMockProvider('A', partialA);
  const providerB = createMockProvider('B', partialB);

  const result = await executeFallbackChain([providerA, providerB], [], start, end);

  expect(result.complete).toBe(true);
  expect(result.providersUsed).toEqual(['A', 'B']);
  expect(result.prices.length).toBeGreaterThanOrEqual(288);
});

test('Skips unavailable providers', async () => {
  const providerA = createMockProvider('A', [], false);
  const providerB = createMockProvider('B', fullData);

  const result = await executeFallbackChain([providerA, providerB], [], start, end);

  expect(result.complete).toBe(true);
  expect(result.providersUsed).toEqual(['B']);
  expect(providerA.fetchPrices).not.toHaveBeenCalled();
});

test('Returns incomplete when all providers fail', async () => {
  const providerA = createMockProvider('A', []);
  const providerB = createMockProvider('B', []);

  const result = await executeFallbackChain([providerA, providerB], [], start, end);

  expect(result.complete).toBe(false);
  expect(result.prices).toHaveLength(0);
});

test('Returns incomplete when no providers available', async () => {
  const result = await executeFallbackChain([], [], start, end);

  expect(result.complete).toBe(false);
  expect(result.providersUsed).toEqual([]);
});
