import { PriceRow } from '../types/types';
import { EntsoTimeSeries } from '../types/types';
import dateUtils from '../utils/dateUtils';
import utils from '../utils/utils';
import parser from 'fast-xml-parser';

interface PriceRowForParsing {
  start: string;
  price?: number;
}

export default {
  parseXML: function (input: string): PriceRow[] {
    const xmlParser = new parser.XMLParser();
    const parsed = xmlParser.parse(input);
    const timeSeries = parsed['Publication_MarketDocument']['TimeSeries'];
    /*
    const allSeries = timeSeries.flatMap((t: any) => t['Period']['Point']) as EntsoTimeSeries[];
    let time = dateUtils.parseISODate(timeSeries[0]['Period']['timeInterval']['start']);
    console.log(`start time = ${time}`);
    */

    const rows: PriceRowForParsing[] = [];
    timeSeries.forEach((ts: any) => {
      let time = dateUtils.parseISODate(ts['Period']['timeInterval']['start']);
      const periods = ts['Period']['Point'] as EntsoTimeSeries[];
      for (let pos = 1; pos <= 24; pos++) {
        const period = periods[pos - 1];
        const priceForPeriod = period && (pos === period.position) ? Number(utils.getPrice(period['price.amount'])) : undefined;
        rows.push(
          {
            start: `${time.toISO()}`,
            price: priceForPeriod,
          }
        )
        time = time.plus({ hours: 1 });
      }
      /*
      periods.forEach((p) => {
        rows.push({
          start: `${time.toISO()}`,
          price: Number(utils.getPrice(p['price.amount']))
        })
        time = time.plus({ hours: 1 });
      })
      */
    })

    /*
    const rows = allSeries.reduce<PriceRow[]>((acc, entry) => {
      acc.push({
        start: `${time.toISO()}`,
        price: Number(utils.getPrice(entry['price.amount'])),
      });
      time = time.plus({ hours: 1 });
      console.log(`entry position = ${entry.position}, time = ${time}`)
      return acc;
    }, []);
    */

    console.log('rows = ' + JSON.stringify(rows, null, 2));
    return rows as PriceRow[];
  },
};
