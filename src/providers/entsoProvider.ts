import { SpotPriceProvider } from './spotPriceProvider';
import { PriceRow } from '../types/types';
import { DateTime } from 'luxon';
import { fetchWithTimeout } from '../utils/fetch';
import entsoParser from '../parser/entsoParser';

const entsoProvider: SpotPriceProvider = {
  name: 'ENTSO-E',

  isAvailable(): boolean {
    return !!process.env.ENTSOE_SECURITY_TOKEN;
  },

  async fetchPrices(start: DateTime, end: DateTime): Promise<PriceRow[]> {
    const securityToken = process.env.ENTSOE_SECURITY_TOKEN;
    console.log(`[ENTSO-E] Query period start = ${start}, end = ${end}`);
    const url = `https://web-api.tp.entsoe.eu/api?documentType=A44&out_Domain=10YFI-1--------U&in_Domain=10YFI-1--------U&periodStart=${start.toFormat('yyyyMMddHHmm')}&periodEnd=${end.toFormat('yyyyMMddHHmm')}`;
    try {
      console.log(`[ENTSO-E] Querying Rest API with url = ${url}`);
      const res = await fetchWithTimeout(`${url}&securityToken=${securityToken}`, { method: 'GET' });
      return entsoParser.parseXML(await res.text());
    } catch (error) {
      console.log(`[ENTSO-E] Error:`, error);
      return [];
    }
  },
};

export default entsoProvider;
