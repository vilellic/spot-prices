import { SpotPriceProvider } from './spotPriceProvider';
import { PriceRow } from '../types/types';
import { DateTime } from 'luxon';
import { fetchWithTimeout } from '../utils/fetch';
import constants from '../types/constants';
import utils from '../utils/utils';

export interface NordpoolResponse {
  deliveryDateCET: string;
  version: number;
  updatedAt: string;
  deliveryAreas: string[];
  market: string;
  multiAreaEntries: NordpoolEntry[];
  currency: string;
  exchangeRate: number;
  areaAverages: { areaCode: string; price: number }[];
}

export interface NordpoolEntry {
  deliveryStart: string;
  deliveryEnd: string;
  entryPerArea: Record<string, number>;
}

const AREA = 'FI';

const nordpoolProvider: SpotPriceProvider = {
  name: 'Nordpool',

  isAvailable(): boolean {
    return true;
  },

  async fetchPrices(_start: DateTime, _end: DateTime): Promise<PriceRow[]> {
    // Nordpool dates are CET-based, but local time may be ahead (e.g. EEST = CET+2).
    // Fetch one extra day before "yesterday" to cover the gap at midnight local time.
    const dates = [
      DateTime.now().minus({ days: 2 }).toFormat('yyyy-MM-dd'),
      DateTime.now().minus({ days: 1 }).toFormat('yyyy-MM-dd'),
      DateTime.now().toFormat('yyyy-MM-dd'),
      DateTime.now().plus({ days: 1 }).toFormat('yyyy-MM-dd'),
    ];
    const uniqueDates = [...new Set(dates)];

    const allPrices: PriceRow[] = [];
    for (const date of uniqueDates) {
      const prices = await fetchForDate(date);
      allPrices.push(...prices);
    }
    return allPrices;
  },
};

async function fetchForDate(date: string): Promise<PriceRow[]> {
  const url = `${constants.NORDPOOL_API_PREFIX}?date=${date}&market=DayAhead&deliveryArea=${AREA}&currency=EUR`;
  try {
    console.log(`[Nordpool] Querying Rest API with url = ${url}`);
    const res = await fetchWithTimeout(url, { method: 'GET' });
    if (res.status === 204 || res.status === 404) {
      console.log(`[Nordpool] No data for date ${date} (status ${res.status})`);
      return [];
    }
    if (!res.ok) {
      console.log(`[Nordpool] HTTP error ${res.status} for date ${date}`);
      return [];
    }
    const json = (await res.json()) as NordpoolResponse;
    return parseNordpoolResponse(json);
  } catch (error) {
    console.log(`[Nordpool] Error:`, error);
    return [];
  }
}

export function parseNordpoolResponse(response: NordpoolResponse): PriceRow[] {
  if (!response.multiAreaEntries || response.multiAreaEntries.length === 0) {
    return [];
  }

  return response.multiAreaEntries
    .filter((entry) => entry.entryPerArea[AREA] !== undefined)
    .map((entry) => ({
      start: DateTime.fromISO(entry.deliveryStart, { zone: 'utc' }).toLocal().toISO()!,
      price: Number(utils.getPrice(entry.entryPerArea[AREA])),
    }));
}

export default nordpoolProvider;
