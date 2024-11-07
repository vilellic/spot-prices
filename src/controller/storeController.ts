import NodeCache from 'node-cache';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';
import { SpotPrices } from '../types/types';

export default {
  initCacheFromDisk: function (cache: NodeCache) {
    if (!cache.has(constants.CACHED_NAME_PRICES)) {
      cache.set(constants.CACHED_NAME_PRICES, readStoredResult(constants.CACHED_NAME_PRICES));
    }
    console.log('Cache contents: ');
    console.log('CACHED_NAME_PRICES: ' + JSON.stringify(cache.get(constants.CACHED_NAME_PRICES), null, 2));
    const spotPrices = utils.getSpotPricesFromCache(cache);

    // Invalidate cache if current time is not in todays range
    if (utils.isCacheValid(cache) && !utils.dateIsInPricesList(spotPrices.today, new Date())) {
      console.log('Invalidating old cache');
      this.resetPrices(cache);
    }
  },

  resetPrices: function (cache: NodeCache) {
    console.log(cache.getStats());
    cache.flushAll();
    console.log('** Cache has been flushed **');
  },

  initStoredFilesIfNotExists: function () {
    if (!existsSync(getStoredResultFileName(constants.CACHED_NAME_PRICES))) {
      console.log('initializeStoredFiles()');
      resetStoredFiles();
    }
  },

  updateStoredResultWhenChanged: function (name: string, value: object) {
    const spotPrices = value as SpotPrices;
    const fromFile = readFileSync(getStoredResultFileName(name));
    const json = JSON.parse(fromFile.toString());

    const yesterday = dateUtils.getYesterdayName();
    const today = dateUtils.getTodayName();
    const tomorrow = dateUtils.getTomorrowName();

    const updated = {
      [yesterday]: json.yesterday,
      [today]: json.today,
      [tomorrow]: json.tomorrow,
      ...(utils.isPriceListComplete(spotPrices.yesterday) && { [yesterday]: spotPrices.yesterday }),
      ...(utils.isPriceListComplete(spotPrices.today) && { [today]: spotPrices.today }),
      ...(utils.isPriceListComplete(spotPrices.tomorrow) && { [tomorrow]: spotPrices.tomorrow }),
    };

    if (JSON.stringify(updated) !== JSON.stringify(json)) {
      writeToDisk(name, JSON.stringify(updated, null, 2));
    }
  },
};

function getStoredResultFileName(name: string) {
  return './' + name + '.json';
}

function readStoredResult(name: string) {
  const fromFile = readFileSync(getStoredResultFileName(name));
  const json = JSON.parse(fromFile.toString());
  return {
    yesterday: json[dateUtils.getYesterdayName()],
    today: json[dateUtils.getTodayName()],
    tomorrow: json[dateUtils.getTomorrowName()],
  };
}

function writeToDisk(name: string, content: string) {
  try {
    writeFileSync(getStoredResultFileName(name), content, 'utf8');
    console.log('Updated result to disk = ' + name);
  } catch (error) {
    console.log('writeToDisk: error ', error);
  }
}

function resetStoredFiles() {
  console.log('resetStoredFiles()');
  writeToDisk(constants.CACHED_NAME_PRICES, '{}');
}
