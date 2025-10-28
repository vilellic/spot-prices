import { IncomingMessage, ServerResponse } from 'http';
import NodeCache from 'node-cache';
import http from 'http';
const server = http.createServer();
import { CronJob } from 'cron';
import { DateTime } from 'luxon';

import rootController from './controller/rootController';
import queryController from './controller/queryController';
import linksController from './controller/linksController';
import storeController from './controller/storeController';
import constants from './types/constants';
import 'dotenv/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('log-timestamp')(function () {
  return '[ ' + DateTime.now().toISO() + ' ] %s';
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('console');

const timeZone = 'Europe/Helsinki';
const spotCache: NodeCache = new NodeCache();

spotCache.on('set', function (key: string, value: object) {
  console.debug('Updating key', key);
  storeController.updateStoredResultWhenChanged(value);
});

server.on('request', async (req: IncomingMessage, res: ServerResponse) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  const url = new URL(req?.url || '', `${constants.PROTOCOL}://${req?.headers.host}`);
  console.log('Request url = ' + url);

  await rootController.updatePrices(spotCache);

  if (req.url === '/') {
    res.end(JSON.stringify(await rootController.handleRoot({ cache: spotCache }), null, 2));
  } else if (req.url?.startsWith('/query')) {
    res.end(JSON.stringify(await queryController.handleQuery({ cache: spotCache, url }), null, 2));
  } else if (req.url?.startsWith('/links')) {
    res.end(JSON.stringify(await linksController.handleLinks({ cache: spotCache, url }), null, 2));
  } else if (req.url === '/reset') {
    storeController.flushCache(spotCache);
    storeController.initCacheFromDB(spotCache);
    res.end('Ok');
  } else if (req.url === '/resetAll') {
    storeController.flushCache(spotCache);
    storeController.dropDB();
    storeController.initDB();
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
    storeController.cleanOldRecords();
    storeController.initCacheFromDB(spotCache);
    rootController.updatePrices(spotCache);
  },
  null,
  true,
  timeZone,
);

console.log('Spot Prices server starting ...');
if (!process.env.ENTSOE_SECURITY_TOKEN) {
  throw Error('Aborting! ENTSOE_SECURITY_TOKEN missing from environment variables');
}
storeController.initDB();
storeController.initCacheFromDB(spotCache);
rootController.updatePrices(spotCache);
console.log('Ready!');
server.listen(constants.PORT);
