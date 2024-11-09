import { IncomingMessage, ServerResponse } from 'http';
import NodeCache from 'node-cache';
import http from 'http';
const server = http.createServer();
import moment from 'moment';
import { CronJob } from 'cron';

import rootController from './controller/rootController';
import queryController from './controller/queryController';
import linksController from './controller/linksController';
import storeController from './controller/storeController';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('log-timestamp')(function () {
  return '[ ' + moment(new Date()).format('YYYY-MM-DD T HH:mm:ss ZZ') + ' ] %s';
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('console');

const protocol: string = 'http';
const port: number = 8089;
const timeZone = 'Europe/Helsinki';

const spotCache: NodeCache = new NodeCache();

spotCache.on('set', function (key: string, value: object) {
  storeController.updateStoredResultWhenChanged(key, value);
});

server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  console.log('Request url = ' + `${protocol}://${req.headers.host}` + req.url);

  await rootController.updatePrices(spotCache);

  if (req.url === '/') {
    rootController.handleRoot({ res: res, cache: spotCache });
  } else if (req.url?.startsWith('/query')) {
    queryController.handleQuery({ res: res, req: req, cache: spotCache });
  } else if (req.url?.startsWith('/links')) {
    linksController.handleLinks({ res: res, req: req, cache: spotCache });
  } else if (req.url === '/reset') {
    storeController.flushCache(spotCache);
    storeController.initCacheFromDisk(spotCache);
    res.end('Ok');
  } else if (req.url === '/resetAll') {
    storeController.flushCache(spotCache);
    storeController.resetStoredFiles();
    res.end('Ok');
  } else {
    res.statusCode = 404;
    res.end('Not found');
  }
});

// every minute
new CronJob(
  '* * * * *',
  function () {
    rootController.updatePrices(spotCache);
  },
  null,
  true,
  timeZone,
);

// at midnight
new CronJob(
  '0 0 * * *',
  function () {
    storeController.flushCache(spotCache);
    storeController.initCacheFromDisk(spotCache);
    rootController.updatePrices(spotCache);
  },
  null,
  true,
  timeZone,
);

console.log('Spot Prices server starting ...');
storeController.initStoredFilesIfNotExists();
storeController.initCacheFromDisk(spotCache);
rootController.updatePrices(spotCache);
console.log('Ready!');
server.listen(port);
