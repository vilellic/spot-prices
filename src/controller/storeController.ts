const { readFileSync } = require('fs')
const { writeFileSync } = require('fs')
const { existsSync } = require('fs')
var constants = require("../types/constants");

module.exports = {

  initializeCacheFromDisk: function (cache: any) {
    if (!cache.has(constants.CACHED_NAME_CURRENT)) {      
      cache.set(constants.CACHED_NAME_CURRENT, readStoredResult(constants.CACHED_NAME_CURRENT))
    }
    if (!cache.has(constants.CACHED_NAME_PRICES)) {
      cache.set(constants.CACHED_NAME_PRICES, readStoredResult(constants.CACHED_NAME_PRICES))
    }
    console.log('Cache contents: ')
    console.log('CACHED_NAME_CURRENT: ' + JSON.stringify(cache.get(constants.CACHED_NAME_CURRENT)))
    console.log('CACHED_NAME_PRICES: ' + JSON.stringify(cache.get(constants.CACHED_NAME_PRICES)))
  },

  resetStoredFiles: function () {
    console.log('resetStoredFiles()')
    writeToDisk(constants.CACHED_NAME_CURRENT, '{}')
    writeToDisk(constants.CACHED_NAME_PRICES, '[]')
  },

  initializeStoredFiles: function () {
    if (!existsSync(getStoredResultFileName(constants.CACHED_NAME_CURRENT)) ||
      !existsSync(getStoredResultFileName(constants.CACHED_NAME_PRICES))) {
      console.log('initializeStoredFiles()')
      this.resetStoredFiles()      
    }
  },

  updateStoredResultWhenChanged: function (name: string, updatedResult: string) {
    const storedResult = JSON.stringify(readStoredResult(name))

    if (updatedResult !== storedResult) {
      console.log(`Writing ${name} to disk`)
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
    console.log('An error has occurred ', error)
  }
}
