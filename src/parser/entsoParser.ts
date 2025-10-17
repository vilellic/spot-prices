import { PriceRow } from '../types/types';
import { EntsoTimeSeries } from '../types/types';
import dateUtils from '../utils/dateUtils';
import utils from '../utils/utils';
import parser from 'fast-xml-parser';

interface PriceRowForParsing {
  start: string;
  price?: string;
}

/*
  How this works:
  * We read each Period’s timeInterval start/end and compute its total duration in minutes. From that we derive quarterSlotsInPeriod = durationMinutes / 15, so DST variants (23h→92 slots, 24h→96 slots, 25h→100 slots) are supported.
  * We parse the resolution (PT60M / PT30M / PT15M) and compute slotsPerOriginalPosition = resolutionMinutes / 15. (Hourly = 4 quarter slots per position, half‑hour = 2, quarter‑hour = 1.)
  * We build a map of the explicitly provided positions (position -> price).
  * We iterate all quarter slots for the Period. For each quarter slot we calculate positionIndex = floor(quarterSlot / slotsPerOriginalPosition) + 1.
  * If that position exists in the map, we update lastPrice. If it does not exist (omitted in the XML), we reuse lastPrice (carry‑forward semantics exactly as described in the ENTSO‑E document for curveType A03).
  * We emit one PriceRow per 15‑minute slot with the carried‑forward price.
 */

export default {
  parseXML: function (input: string): PriceRow[] {
    const xmlParser = new parser.XMLParser();
    const parsed = xmlParser.parse(input);
    const timeSeriesRaw = parsed['Publication_MarketDocument']?.['TimeSeries'];
    if (!timeSeriesRaw) {
      return [];
    }
    const timeSeriesArray = Array.isArray(timeSeriesRaw) ? timeSeriesRaw : [timeSeriesRaw];
    const rows: PriceRowForParsing[] = [];

    timeSeriesArray.forEach((ts: any) => {
      const periodRaw = ts['Period'];
      const periods = Array.isArray(periodRaw) ? periodRaw : [periodRaw];

      periods.forEach((periodObj: any) => {
        const points = periodObj['Point'] as EntsoTimeSeries[];
        const resolutionStr: string = periodObj['resolution'] || 'PT60M'; // correct resolution field
        const startTime = dateUtils.parseISODate(periodObj['timeInterval']['start']);
        const endTime = dateUtils.parseISODate(periodObj['timeInterval']['end']);

        // Duration in minutes determines how many quarter slots we expand (supports 23/24/25 hours for DST days)
        const diffMinutes = Math.max(0, Math.round((endTime.valueOf() - startTime.valueOf()) / (1000 * 60)));
        const quarterSlotsInPeriod = Math.round(diffMinutes / 15); // 92 / 96 / 100 typical

        // Extract minutes from resolution (PT15M / PT30M / PT60M etc.)
        const minutesPerPositionMatch = resolutionStr.match(/PT(\d+)M/i);
        const minutesPerPosition = minutesPerPositionMatch ? Number(minutesPerPositionMatch[1]) : 60;
        const slotsPerOriginalPosition = Math.max(1, Math.ceil(minutesPerPosition / 15));

        // When ENTSO-E omits positions it means price unchanged; we propagate last known price until a new position appears.
        const positionMap: Map<number, string> = new Map(
          points.map((p) => [Number(p.position), utils.getPrice(p['price.amount'])]),
        );

        let lastPrice: string | undefined = positionMap.get(1); // initialize with first position if provided
        for (let quarterSlot = 0; quarterSlot < quarterSlotsInPeriod; quarterSlot++) {
          const positionIndex = Math.floor(quarterSlot / slotsPerOriginalPosition) + 1; // 1-based original position
          if (positionMap.has(positionIndex)) {
            lastPrice = positionMap.get(positionIndex) || lastPrice;
          }
          const time = startTime.plus({ minutes: quarterSlot * 15 });
          rows.push({ start: `${time.toISO()}`, price: lastPrice });
        }
      });
    });

    return rows.map((row) => ({ start: row.start, price: row.price ? Number(row.price) : 0 }));
  },
};
