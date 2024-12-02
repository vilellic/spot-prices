import { PriceRow } from '../types/types';
import parser from 'fast-xml-parser';

export default {
    parseXML: function (input: string): PriceRow[] {
        const xmlParser = new parser.XMLParser();
        const parsed = xmlParser.parse(input);
        const timeSeries = parsed['Publication_MarketDocument']['TimeSeries'];
        const lastSeries = timeSeries.at(-1);
        const points = lastSeries['Period']['Point'];
        console.log(JSON.stringify(points, null, 2));
        return points.map(entry => {
            return {
                start: new Date(),
                price: 12489.23
            }
        }) as PriceRow[];
    },
};

/*

const parseTimeSeries = (timeSeries: ) => {

}

*/