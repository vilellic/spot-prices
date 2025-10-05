import NodeCache from 'node-cache';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { PriceRow, SpotPrices } from '../types/types';
import Database from 'better-sqlite3';

const db = Database('./spot_prices.db');

export default {
  initDB: function () {
    db.exec(`CREATE TABLE IF NOT EXISTS prices (start TEXT PRIMARY KEY, price REAL)`);
  },

  dropDB: function () {
    db.exec(`DROP TABLE IF EXISTS prices`);
  },

  updateToDB: function (spotPrices: SpotPrices) {
    try {
      const insert = db.prepare('INSERT OR REPLACE INTO prices (start, price) VALUES (@start, @price)');
      const transaction = db.transaction((prices: PriceRow[]) => {
        for (const row of prices) {
          insert.run(row);
        }
      });
      transaction(spotPrices.prices);
      if (spotPrices.prices.length > 0) {
        console.debug('Updated result to DB = ' + constants.CACHED_NAME_PRICES);
      }
    } catch (error) {
      console.error('updateToDB: error ', error);
    }
  },

  readPricesFromDB: function (): SpotPrices {
    try {
      const rows = db.prepare('SELECT * FROM prices ORDER BY start').all() as PriceRow[];
      return { prices: rows.map((row) => ({ start: row.start, price: row.price })) };
    } catch (error) {
      console.error('readPricesFromDB: error ', error);
      return { prices: [] };
    }
  },

  initCacheFromDB: function (cache: NodeCache) {
    cache.set(constants.CACHED_NAME_PRICES, this.readPricesFromDB());

    const spotPrices = utils.getSpotPricesFromCache(cache);
    if (spotPrices.prices && spotPrices.prices.length > 0) {
      console.log('-- Cache contents: --');
      console.log(`${constants.CACHED_NAME_PRICES} ${JSON.stringify(spotPrices, null, 2)}`);
    }

    // Invalidate cache if current time is not in list
    if (spotPrices.prices?.length > 0 && !utils.dateIsInPricesList(spotPrices.prices, new Date())) {
      console.info('Invalidating old cache');
      this.flushCache(cache);
    }
  },

  flushCache: function (cache: NodeCache) {
    console.debug(cache.getStats());
    cache.flushAll();
    console.info('** Cache has been flushed **');
  },

  updateStoredResultWhenChanged: function (value: object) {
    const inMemorySpotPrices = value as SpotPrices;
    const persistedSpotPrices = this.readPricesFromDB();

    const mergedPrices: PriceRow[] = [...(inMemorySpotPrices.prices || []), ...(persistedSpotPrices.prices || [])];
    const filteredPrices: PriceRow[] = utils.removeDuplicatesAndSort(dateUtils.getHoursToStore(mergedPrices));
    const newSpotPrices: SpotPrices = { prices: filteredPrices };

    if (newSpotPrices.prices.length > 0 && JSON.stringify(newSpotPrices) !== JSON.stringify(persistedSpotPrices)) {
      this.updateToDB(newSpotPrices);
    }
  },
};
