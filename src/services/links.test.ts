import { TransferPrices } from '../types/types';
import links from './links';

const fixedFakeDate = new Date('2025-10-16');

jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('test get links default', () => {
  const output = links.getExampleLinks({ host: 'http://localhost:8089', tomorrowAvailable: true, noHours: 3 });
  expect(output).toStrictEqual({
    withTransferPrices: {
      today: {
        HighestAverage:
          'http://localhost:8089/query?queryMode=HighestAverage&hours=3&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        LowestAverage:
          'http://localhost:8089/query?queryMode=LowestAverage&hours=3&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        LowestWeighted:
          'http://localhost:8089/query?queryMode=LowestWeighted&hours=3&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
      },
      tomorrow: {
        HighestAverage:
          'http://localhost:8089/query?queryMode=HighestAverage&hours=3&startTime=1760637600&endTime=1760724000&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        LowestAverage:
          'http://localhost:8089/query?queryMode=LowestAverage&hours=3&startTime=1760637600&endTime=1760724000&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        LowestWeighted:
          'http://localhost:8089/query?queryMode=LowestWeighted&hours=3&startTime=1760637600&endTime=1760724000&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
      },
    },
    withoutTransferPrices: {
      today: {
        HighestAverage:
          'http://localhost:8089/query?queryMode=HighestAverage&hours=3&startTime=1760551200&endTime=1760637600',
        LowestAverage:
          'http://localhost:8089/query?queryMode=LowestAverage&hours=3&startTime=1760551200&endTime=1760637600',
        LowestWeighted:
          'http://localhost:8089/query?queryMode=LowestWeighted&hours=3&startTime=1760551200&endTime=1760637600',
      },
      tomorrow: {
        HighestAverage:
          'http://localhost:8089/query?queryMode=HighestAverage&hours=3&startTime=1760637600&endTime=1760724000',
        LowestAverage:
          'http://localhost:8089/query?queryMode=LowestAverage&hours=3&startTime=1760637600&endTime=1760724000',
        LowestWeighted:
          'http://localhost:8089/query?queryMode=LowestWeighted&hours=3&startTime=1760637600&endTime=1760724000',
      },
    },
  });
});

test('test get links, tomorrow prices not ready', () => {
  const output = links.getExampleLinks({ host: 'http://localhost:8089', tomorrowAvailable: false });
  expect(output).toStrictEqual({
    withTransferPrices: {
      today: {
        HighestAverage:
          'http://localhost:8089/query?queryMode=HighestAverage&hours=6&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        LowestAverage:
          'http://localhost:8089/query?queryMode=LowestAverage&hours=6&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
        LowestWeighted:
          'http://localhost:8089/query?queryMode=LowestWeighted&hours=6&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445',
      },
      tomorrow: ['no prices yet...'],
    },
    withoutTransferPrices: {
      today: {
        HighestAverage:
          'http://localhost:8089/query?queryMode=HighestAverage&hours=6&startTime=1760551200&endTime=1760637600',
        LowestAverage:
          'http://localhost:8089/query?queryMode=LowestAverage&hours=6&startTime=1760551200&endTime=1760637600',
        LowestWeighted:
          'http://localhost:8089/query?queryMode=LowestWeighted&hours=6&startTime=1760551200&endTime=1760637600',
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
    withTransferPrices: {
      today: {
        HighestAverage:
          'http://someotherhost:8089/query?queryMode=HighestAverage&hours=6&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
        LowestAverage:
          'http://someotherhost:8089/query?queryMode=LowestAverage&hours=6&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
        LowestWeighted:
          'http://someotherhost:8089/query?queryMode=LowestWeighted&hours=6&startTime=1760551200&endTime=1760637600&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
      },
      tomorrow: {
        HighestAverage:
          'http://someotherhost:8089/query?queryMode=HighestAverage&hours=6&startTime=1760637600&endTime=1760724000&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
        LowestAverage:
          'http://someotherhost:8089/query?queryMode=LowestAverage&hours=6&startTime=1760637600&endTime=1760724000&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
        LowestWeighted:
          'http://someotherhost:8089/query?queryMode=LowestWeighted&hours=6&startTime=1760637600&endTime=1760724000&offPeakTransferPrice=0.0602372&peakTransferPrice=0.0793372',
      },
    },
    withoutTransferPrices: {
      today: {
        HighestAverage:
          'http://someotherhost:8089/query?queryMode=HighestAverage&hours=6&startTime=1760551200&endTime=1760637600',
        LowestAverage:
          'http://someotherhost:8089/query?queryMode=LowestAverage&hours=6&startTime=1760551200&endTime=1760637600',
        LowestWeighted:
          'http://someotherhost:8089/query?queryMode=LowestWeighted&hours=6&startTime=1760551200&endTime=1760637600',
      },
      tomorrow: {
        HighestAverage:
          'http://someotherhost:8089/query?queryMode=HighestAverage&hours=6&startTime=1760637600&endTime=1760724000',
        LowestAverage:
          'http://someotherhost:8089/query?queryMode=LowestAverage&hours=6&startTime=1760637600&endTime=1760724000',
        LowestWeighted:
          'http://someotherhost:8089/query?queryMode=LowestWeighted&hours=6&startTime=1760637600&endTime=1760724000',
      },
    },
  });
});
