import NodeCache from "node-cache";
import { getEmptySpotPrices } from "../types/types";
const { readFileSync } = require('fs')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')
const constants = require("../types/constants");
const utils = require("../utils/utils");

module.exports = {

  initCacheFromDisk: function (cache: NodeCache) {
    if (!cache.has(constants.CACHED_NAME_PRICES)) {
      cache.set(constants.CACHED_NAME_PRICES, readStoredResult(constants.CACHED_NAME_PRICES))
    }
    console.log('Cache contents: ')
    console.log('CACHED_NAME_PRICES: ' + JSON.stringify(cache.get(constants.CACHED_NAME_PRICES), null, 2))
    const spotPrices = utils.getSpotPricesFromCache(cache)

    // Invalidate cache if current time is not in todays range
    if (utils.isCacheReady(cache) && !utils.dateIsInPricesList(spotPrices.today, new Date())) {
      console.log('Invalidating old cache')
      this.resetPrices(cache)
    }
  },

  resetPrices: function(cache: NodeCache) {
    resetStoredFiles()
    console.log(cache.getStats())
    cache.flushAll()
    console.log('** Cache has been flushed **')
  },

  initStoredFilesIfNotExists: function () {
    if (!existsSync(getStoredResultFileName(constants.CACHED_NAME_PRICES))) {
      console.log('initializeStoredFiles()')
      resetStoredFiles()      
    }
  },

  updateStoredResultWhenChanged: function (name: string, updatedResult: string) {
    const storedResult = JSON.stringify(readStoredResult(name))

    if (updatedResult !== storedResult) {
      writeToDisk(name, updatedResult)
    }
  }
}

function getStoredResultFileName(name: string) {
  return './' + name + '.json'
}

function readStoredResult(name: string) {
  const data = readFileSync(getStoredResultFileName(name))
  return JSON.parse(data)
}

function writeToDisk(name: string, content: string) {
  try {
    writeFileSync(getStoredResultFileName(name), content, 'utf8')
    console.log('Updated result to disk = ' + name)
  } catch (error) {
    console.log('writeToDisk: error ', error)
  }
}

function resetStoredFiles() {
  console.log('resetStoredFiles()')
  writeToDisk(constants.CACHED_NAME_PRICES, JSON.stringify(getEmptySpotPrices()))
}