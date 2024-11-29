import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

const fixedFakeDate = new Date('2024-11-18');
jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('Parse Elering API response store to cache and check contents', async () => {
  //const nodeCache = new NodeCache();
  //await rootController.updatePrices(nodeCache);
});
