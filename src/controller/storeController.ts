import NodeCache from 'node-cache';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { PriceRow, SpotPrices } from '../types/types';

export default {
  initCacheFromDisk: function (cache: NodeCache) {
    cache.set(constants.CACHED_NAME_PRICES, readStoredSpotPrices());
    console.log('Cache contents: ');
    const spotPrices = utils.getSpotPricesFromCache(cache);
    console.log(`${constants.CACHED_NAME_PRICES} ${JSON.stringify(spotPrices, null, 2)}`);

    // Invalidate cache if current time is not in list
    if (!utils.dateIsInPricesList(spotPrices.prices, new Date())) {
      console.log('Invalidating old cache');
      this.flushCache(cache);
    }
  },

  flushCache: function (cache: NodeCache) {
    console.log(cache.getStats());
    cache.flushAll();
    console.log('** Cache has been flushed **');
  },

  initStoredFilesIfNotExists: function () {
    if (!existsSync(getStoredResultFileName(constants.CACHED_NAME_PRICES))) {
      this.resetStoredFiles();
    }
  },

  updateStoredResultWhenChanged: function (name: string, value: object) {
    const inMemorySpotPrices = value as SpotPrices;
    const persistedSpotPrices = JSON.parse(readFileSync(getStoredResultFileName(name)).toString()) as SpotPrices;

    const mergedPrices: PriceRow[] = [...(inMemorySpotPrices.prices || []), ...(persistedSpotPrices.prices || [])];
    const filteredPrices: PriceRow[] = utils.removeDuplicatesAndSort(dateUtils.getHoursToStore(mergedPrices));
    const newSpotPrices: SpotPrices = { prices: filteredPrices };

    if (JSON.stringify(newSpotPrices) !== JSON.stringify(persistedSpotPrices)) {
      writeToDisk(name, JSON.stringify(newSpotPrices, null, 2));
    }
  },

  resetStoredFiles: function () {
    console.log('resetStoredFiles()');
    writeToDisk(constants.CACHED_NAME_PRICES, '{}');
  },
};

function getStoredResultFileName(name: string) {
  return './' + name + '.json';
}

function readStoredSpotPrices() {
  return JSON.parse(readFileSync(getStoredResultFileName(constants.CACHED_NAME_PRICES)).toString()) as SpotPrices;
}

function writeToDisk(name: string, content: string) {
  try {
    writeFileSync(getStoredResultFileName(name), content, 'utf8');
    console.log('Updated result to disk = ' + name);
  } catch (error) {
    console.log('writeToDisk: error ', error);
  }
}
