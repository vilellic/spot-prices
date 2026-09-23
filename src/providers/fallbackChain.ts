import { SpotPriceProvider } from './spotPriceProvider';
import { PriceRow } from '../types/types';
import { DateTime } from 'luxon';
import utils from '../utils/utils';

export interface FetchResult {
  prices: PriceRow[];
  providersUsed: string[];
  complete: boolean;
}

export async function executeFallbackChain(
  providers: SpotPriceProvider[],
  existingPrices: PriceRow[],
  start: DateTime,
  end: DateTime,
): Promise<FetchResult> {
  const availableProviders = providers.filter((p) => p.isAvailable());
  if (availableProviders.length === 0) {
    console.warn('No price providers available');
    return { prices: existingPrices, providersUsed: [], complete: false };
  }

  let mergedPrices = [...existingPrices];
  const providersUsed: string[] = [];

  for (const provider of availableProviders) {
    try {
      console.log(`[FallbackChain] Trying provider: ${provider.name}`);
      const fetched = await provider.fetchPrices(start, end);
      if (fetched.length > 0) {
        mergedPrices = utils.removeDuplicatesAndSort([...mergedPrices, ...fetched]);
        providersUsed.push(provider.name);
        console.log(`[FallbackChain] Got ${fetched.length} prices from ${provider.name}`);
      }

      if (!utils.checkArePricesMissing(mergedPrices)) {
        console.log(`[FallbackChain] Data complete after ${provider.name}`);
        return { prices: mergedPrices, providersUsed, complete: true };
      }

      console.log(`[FallbackChain] Still missing data after ${provider.name}, trying next provider ...`);
    } catch (error) {
      console.log(`[FallbackChain] Error from ${provider.name}:`, error);
    }
  }

  const complete = !utils.checkArePricesMissing(mergedPrices);
  console.log(`[FallbackChain] All providers exhausted. Complete: ${complete}`);
  return { prices: mergedPrices, providersUsed, complete };
}
