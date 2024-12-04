import { PriceRow } from '../types/types';
import { EntsoTimeSeries } from '../types/types';
import dateUtils from '../utils/dateUtils';
import utils from '../utils/utils';
import parser from 'fast-xml-parser';

export default {
  parseXML: function (input: string): PriceRow[] {
    const xmlParser = new parser.XMLParser();
    const parsed = xmlParser.parse(input);
    const timeSeries = parsed['Publication_MarketDocument']['TimeSeries'];
    const allSeries = timeSeries.flatMap((t: any) => t['Period']['Point']) as EntsoTimeSeries[];
    let time = dateUtils.parseISODate(timeSeries[0]['Period']['timeInterval']['start']);
    return allSeries.reduce<PriceRow[]>((acc, entry) => {
      acc.push({
        start: `${time.toISO()}`,
        price: Number(utils.getPrice(entry['price.amount'])),
      });
      time = time.plus({ hours: 1 });
      return acc;
    }, []);
  },
};
