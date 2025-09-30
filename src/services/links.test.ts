import { TransferPrices } from '../types/types';
import links from './links';

// Will resolve to Tue Sep 12 2023 03:00:00 GMT+0300 (Eastern European Summer Time)
const fixedFakeDate = new Date('2023-09-12');

jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('test get links default', () => {
  const output = links.getExampleLinks({ host: 'http://localhost:8089', tomorrowAvailable: true, noHours: 3 });
  expect(output).toStrictEqual({
    withoutTransferPrices: {
      today: {
        WeightedPrices:
          'http://localhost:8089/query?queryMode=WeightedPrices&hours=3&startTime=1694455200&endTime=1694541600',
        SequentialPrices:
          'http://localhost:8089/query?queryMode=SequentialPrices&hours=3&startTime=1694455200&endTime=1694541600',
      },
      tomorrow: {
        WeightedPrices:
          'http://localhost:8089/query?queryMode=WeightedPrices&hours=3&startTime=1694541600&endTime=1694628000',
        SequentialPrices:
          'http://localhost:8089/query?queryMode=SequentialPrices&hours=3&startTime=1694541600&endTime=1694628000',
      },
    },
    withTransferPrices: {
      today: {
        WeightedPrices:
          'http://localhost:8089/query?queryMode=WeightedPrices&hours=3&startTime=1694455200&endTime=1694541600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        SequentialPrices:
          'http://localhost:8089/query?queryMode=SequentialPrices&hours=3&startTime=1694455200&endTime=1694541600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
      },
      tomorrow: {
        WeightedPrices:
          'http://localhost:8089/query?queryMode=WeightedPrices&hours=3&startTime=1694541600&endTime=1694628000&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        SequentialPrices:
          'http://localhost:8089/query?queryMode=SequentialPrices&hours=3&startTime=1694541600&endTime=1694628000&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
      },
    },
  });
});

test('test get links, tomorrow prices not ready', () => {
  const output = links.getExampleLinks({ host: 'http://localhost:8089', tomorrowAvailable: false });
  expect(output).toStrictEqual({
    withoutTransferPrices: {
      today: {
        WeightedPrices:
          'http://localhost:8089/query?queryMode=WeightedPrices&hours=6&startTime=1694455200&endTime=1694541600',
        SequentialPrices:
          'http://localhost:8089/query?queryMode=SequentialPrices&hours=6&startTime=1694455200&endTime=1694541600',
      },
      tomorrow: ['no prices yet...'],
    },
    withTransferPrices: {
      today: {
        WeightedPrices:
          'http://localhost:8089/query?queryMode=WeightedPrices&hours=6&startTime=1694455200&endTime=1694541600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        SequentialPrices:
          'http://localhost:8089/query?queryMode=SequentialPrices&hours=6&startTime=1694455200&endTime=1694541600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
      },
      tomorrow: ['no prices yet...'],
    },
  });
});

test('test get links, custom transfer prices', () => {
  const transferPrices: TransferPrices = {
    peakTransfer: 0.0793372,
    offPeakTransfer: 0.0602372,
  };

  const output = links.getExampleLinks({
    host: 'http://someotherhost:8089',
    tomorrowAvailable: true,
    transferPrices: transferPrices,
  });

  expect(output).toStrictEqual({
    withoutTransferPrices: {
      today: {
        WeightedPrices:
          'http://someotherhost:8089/query?queryMode=WeightedPrices&hours=6&startTime=1694455200&endTime=1694541600',
        SequentialPrices:
          'http://someotherhost:8089/query?queryMode=SequentialPrices&hours=6&startTime=1694455200&endTime=1694541600',
      },
      tomorrow: {
        WeightedPrices:
          'http://someotherhost:8089/query?queryMode=WeightedPrices&hours=6&startTime=1694541600&endTime=1694628000',
        SequentialPrices:
          'http://someotherhost:8089/query?queryMode=SequentialPrices&hours=6&startTime=1694541600&endTime=1694628000',
      },
    },
    withTransferPrices: {
      today: {
        WeightedPrices:
          'http://someotherhost:8089/query?queryMode=WeightedPrices&hours=6&startTime=1694455200&endTime=1694541600&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
        SequentialPrices:
          'http://someotherhost:8089/query?queryMode=SequentialPrices&hours=6&startTime=1694455200&endTime=1694541600&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
      },
      tomorrow: {
        WeightedPrices:
          'http://someotherhost:8089/query?queryMode=WeightedPrices&hours=6&startTime=1694541600&endTime=1694628000&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
        SequentialPrices:
          'http://someotherhost:8089/query?queryMode=SequentialPrices&hours=6&startTime=1694541600&endTime=1694628000&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
      },
    },
  });
});
