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
    const lastSeries = timeSeries.at(-1);
    let time = dateUtils.parseISODate(lastSeries['Period']['timeInterval']['start']);
    console.log('startTime = ' + time.toISO());
    const points = lastSeries['Period']['Point'] as EntsoTimeSeries[];
    console.log(JSON.stringify(points, null, 2));
    return points.reduce<PriceRow[]>((acc, entry) => {
      acc.push({
        start: `${time.toISO()}`,
        price: Number(utils.getPrice(entry['price.amount'])),
      });
      time = time.plus({ hours: 1 });
      return acc;
    }, []);
  },
};
