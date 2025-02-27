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

      // TimeStepPosition = StartDateTimeofTimeInterval + (Resolution*(Pos −1))
      // https://eepublicdownloads.entsoe.eu/clean-documents/EDI/Library/cim_based/Introduction_of_different_Timeseries_possibilities__curvetypes__with_ENTSO-E_electronic_document_v1.4.pdf

      let price;
      for (let pos = 1; pos <= 24; pos++) {
        if (positionMap.has(pos)) {
          price = positionMap.get(pos) || '';
        }
        const time = startTime.plus({ hours: pos - 1 });
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
