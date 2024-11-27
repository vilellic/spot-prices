import NodeCache from 'node-cache';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import constants from '../types/constants';
import utils from '../utils/utils';
import dateUtils from '../utils/dateUtils';

export default {
  initCacheFromDisk: function (cache: NodeCache) {
    if (!cache.has(constants.CACHED_NAME_PRICES)) {
      cache.set(constants.CACHED_NAME_PRICES, readStoredResult(constants.CACHED_NAME_PRICES));
    }
    console.log('Cache contents: ');
    console.log('CACHED_NAME_PRICES: ' + JSON.stringify(cache.get(constants.CACHED_NAME_PRICES), null, 2));
    const spotPrices = utils.getSpotPricesFromCache(cache);

    // Invalidate cache if current time is not in todays range
    if (utils.isCacheValid(cache) && !utils.dateIsInPricesList(spotPrices.prices, new Date())) {
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
      console.log('initializeStoredFiles()');
      this.resetStoredFiles();
    }
  },

  updateStoredResultWhenChanged: function (name: string, value: object) {
    console.log('name = ' + name + ", value = " + value);
    /*
    const spotPrices = value as SpotPrices;
    const fromFile = readFileSync(getStoredResultFileName(name));
    const json = JSON.parse(fromFile.toString());

    const otherday = dateUtils.getDateJsonName(-2);
    const yesterday = dateUtils.getYesterdayName();
    const today = dateUtils.getTodayName();
    const tomorrow = dateUtils.getTomorrowName();

    const yesterdayKeyFromCache = dateUtils.getDateFromFirstRow(spotPrices.yesterday) || yesterday;
    const todayKeyFromCache = dateUtils.getDateFromFirstRow(spotPrices.today) || today;
    const tomorrowKeyFromCache = dateUtils.getDateFromFirstRow(spotPrices.tomorrow) || tomorrow;

    const updated = {
      [otherday]: json[otherday],
      [yesterday]: json[yesterday],
      [today]: json[today],
      [tomorrow]: json[tomorrow],
      ...(utils.isPriceListComplete(spotPrices.yesterday) && { [yesterdayKeyFromCache]: spotPrices.yesterday }),
      ...(utils.isPriceListComplete(spotPrices.today) && { [todayKeyFromCache]: spotPrices.today }),
      ...(utils.isPriceListComplete(spotPrices.tomorrow) && { [tomorrowKeyFromCache]: spotPrices.tomorrow }),
    };

    if (JSON.stringify(updated) !== JSON.stringify(json)) {
      writeToDisk(name, JSON.stringify(updated, null, 2));
    }
      */
  },

  resetStoredFiles: function () {
    console.log('resetStoredFiles()');
    writeToDisk(constants.CACHED_NAME_PRICES, '{}');
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
