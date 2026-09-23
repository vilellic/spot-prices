import { PriceRow } from '../types/types';
import { DateTime } from 'luxon';

export interface SpotPriceProvider {
  name: string;
  fetchPrices(start: DateTime, end: DateTime): Promise<PriceRow[]>;
  isAvailable(): boolean;
}
