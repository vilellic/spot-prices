import { SpotPriceProvider } from './spotPriceProvider';
import { EleringResponse, PriceRow } from '../types/types';
import { DateTime } from 'luxon';
import { fetchWithTimeout } from '../utils/fetch';
import constants from '../types/constants';
import utils from '../utils/utils';

const eleringProvider: SpotPriceProvider = {
  name: 'Elering',

  isAvailable(): boolean {
    return true;
  },

  async fetchPrices(start: DateTime, end: DateTime): Promise<PriceRow[]> {
    const prices: PriceRow[] = [];
    const eleringResponse = await fetchFromElering(start, end);
    if (eleringResponse.success === true) {
      for (let i = 0; i < eleringResponse.data.fi.length; i++) {
        const priceRow: PriceRow = {
          start: DateTime.fromSeconds(eleringResponse.data.fi[i].timestamp).toISO(),
          price: Number(utils.getPrice(eleringResponse.data.fi[i].price)),
        };
        prices.push(priceRow);
      }
    }
    return prices;
  },
};

async function fetchFromElering(start: DateTime, end: DateTime): Promise<EleringResponse> {
  const url = `${constants.ELERING_API_PREFIX}/price?start=${start.toUTC().toISO()}&end=${end.toUTC().toISO()}`;
  try {
    console.log(`[Elering] Querying Rest API with url = ${url}`);
    const res = await fetchWithTimeout(url, { method: 'GET' });
    const json = await res.json();
    return json as EleringResponse;
  } catch (error) {
    console.log(`[Elering] Error:`, error);
    return { success: false } as EleringResponse;
  }
}

export default eleringProvider;
