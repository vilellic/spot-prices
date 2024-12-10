import { PriceRow } from '../types/types';
import { EntsoTimeSeries } from '../types/types';
import dateUtils from '../utils/dateUtils';
import utils from '../utils/utils';
import parser from 'fast-xml-parser';

interface PriceRowForParsing {
  start: string;
  price?: string;
}

export default {
  parseXML: function (input: string): PriceRow[] {
    const xmlParser = new parser.XMLParser();
    const parsed = xmlParser.parse(input);
    const timeSeries = parsed['Publication_MarketDocument']['TimeSeries'];
    const rows: PriceRowForParsing[] = [];

    timeSeries.forEach((ts: any) => {
      const periods = ts['Period']['Point'] as EntsoTimeSeries[];
      const positionMap: Map<number, string> = new Map(
        periods.map((period) => [Number(period.position), utils.getPrice(period['price.amount'])]),
      );
      let time = dateUtils.parseISODate(ts['Period']['timeInterval']['start']);

      let price;
      for (let pos = 1; pos <= 24; pos++) {
        if (positionMap.has(pos)) {
          price = positionMap.get(pos) || '';
        }
        rows.push({
          start: `${time.toISO()}`,
          price: price,
        });
        time = time.plus({ hours: 1 });
      }
    });

    return rows.map((row) => {
      return {
        start: row.start,
        price: Number(row.price),
      };
    });
  },
};
