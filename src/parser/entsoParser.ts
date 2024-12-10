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
      const startTime = dateUtils.parseISODate(ts['Period']['timeInterval']['start']);

      // DST: mennään talviaikaan --> 25 tuntia (positions)
      // DST: mennään kesäaikaan --> 23 tuntia
      // DST, mutta huom. voi olla tyhjiä välissä
      // Voi päätellä viimeisestä positionista (onko 25/23)
      // TimeStepPosition = StartDateTimeofTimeInterval + (Resolution*(Pos −1))

      let price;
      for (let pos = 1; pos <= 24; pos++) {
        if (positionMap.has(pos)) {
          price = positionMap.get(pos) || '';
        }
        const time = startTime.plus({ hours: pos - 1 })
        rows.push({
          start: `${time.toISO()}`,
          price: price,
        });
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
