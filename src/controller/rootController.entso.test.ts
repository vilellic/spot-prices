import fetchMock from 'jest-fetch-mock';
import entsoParser from '../parser/entsoParser';
fetchMock.enableMocks();

const fixedFakeDate = new Date('2024-12-02');
jest.useFakeTimers().setSystemTime(fixedFakeDate);

test('Parse Entso-E API response store to cache and check contents', async () => {
  fetchMock.mockResponse(
    `<?xml version="1.0" encoding="utf-8"?>
<Publication_MarketDocument xmlns="urn:iec62325.351:tc57wg16:451-3:publicationdocument:7:3">
  <mRID>48197884494944ef8d4351c97dd90e7f</mRID>
  <revisionNumber>1</revisionNumber>
  <type>A44</type>
  <sender_MarketParticipant.mRID codingScheme="A01">10X1001A1001A450</sender_MarketParticipant.mRID>
  <sender_MarketParticipant.marketRole.type>A32</sender_MarketParticipant.marketRole.type>
  <receiver_MarketParticipant.mRID codingScheme="A01">10X1001A1001A450</receiver_MarketParticipant.mRID>
  <receiver_MarketParticipant.marketRole.type>A33</receiver_MarketParticipant.marketRole.type>
  <createdDateTime>2024-12-02T15:36:09Z</createdDateTime>
  <period.timeInterval>
    <start>2024-11-30T23:00Z</start>
    <end>2024-12-02T23:00Z</end>
  </period.timeInterval>
      <TimeSeries>
        <mRID>1</mRID>
        <auction.type>A01</auction.type>
        <businessType>A62</businessType>
        <in_Domain.mRID codingScheme="A01">10YFI-1--------U</in_Domain.mRID>
        <out_Domain.mRID codingScheme="A01">10YFI-1--------U</out_Domain.mRID>
        <contract_MarketAgreement.type>A01</contract_MarketAgreement.type>
        <currency_Unit.name>EUR</currency_Unit.name>
        <price_Measure_Unit.name>MWH</price_Measure_Unit.name>
        <curveType>A03</curveType>
            <Period>
              <timeInterval>
                <start>2024-11-30T23:00Z</start>
                <end>2024-12-01T23:00Z</end>
              </timeInterval>
              <resolution>PT60M</resolution>
                  <Point>
                    <position>1</position>
                        <price.amount>10.4</price.amount>
                  </Point>
                  <Point>
                    <position>2</position>
                        <price.amount>10.08</price.amount>
                  </Point>
                  <Point>
                    <position>3</position>
                        <price.amount>10.23</price.amount>
                  </Point>
                  <Point>
                    <position>4</position>
                        <price.amount>10.49</price.amount>
                  </Point>
                  <Point>
                    <position>5</position>
                        <price.amount>10.95</price.amount>
                  </Point>
                  <Point>
                    <position>6</position>
                        <price.amount>10.94</price.amount>
                  </Point>
                  <Point>
                    <position>7</position>
                        <price.amount>10.58</price.amount>
                  </Point>
                  <Point>
                    <position>8</position>
                        <price.amount>11.42</price.amount>
                  </Point>
                  <Point>
                    <position>9</position>
                        <price.amount>10.67</price.amount>
                  </Point>
                  <Point>
                    <position>10</position>
                        <price.amount>10.35</price.amount>
                  </Point>
                  <Point>
                    <position>11</position>
                        <price.amount>9.85</price.amount>
                  </Point>
                  <Point>
                    <position>12</position>
                        <price.amount>9.13</price.amount>
                  </Point>
                  <Point>
                    <position>13</position>
                        <price.amount>6.14</price.amount>
                  </Point>
                  <Point>
                    <position>14</position>
                        <price.amount>5.56</price.amount>
                  </Point>
                  <Point>
                    <position>15</position>
                        <price.amount>4.84</price.amount>
                  </Point>
                  <Point>
                    <position>16</position>
                        <price.amount>4.73</price.amount>
                  </Point>
                  <Point>
                    <position>17</position>
                        <price.amount>3.48</price.amount>
                  </Point>
                  <Point>
                    <position>18</position>
                        <price.amount>3.17</price.amount>
                  </Point>
                  <Point>
                    <position>19</position>
                        <price.amount>3.56</price.amount>
                  </Point>
                  <Point>
                    <position>20</position>
                        <price.amount>2.93</price.amount>
                  </Point>
                  <Point>
                    <position>21</position>
                        <price.amount>2.69</price.amount>
                  </Point>
                  <Point>
                    <position>22</position>
                        <price.amount>2.1</price.amount>
                  </Point>
                  <Point>
                    <position>23</position>
                        <price.amount>1.62</price.amount>
                  </Point>
                  <Point>
                    <position>24</position>
                        <price.amount>0.01</price.amount>
                  </Point>
            </Period>
      </TimeSeries>
      <TimeSeries>
        <mRID>2</mRID>
        <auction.type>A01</auction.type>
        <businessType>A62</businessType>
        <in_Domain.mRID codingScheme="A01">10YFI-1--------U</in_Domain.mRID>
        <out_Domain.mRID codingScheme="A01">10YFI-1--------U</out_Domain.mRID>
        <contract_MarketAgreement.type>A01</contract_MarketAgreement.type>
        <currency_Unit.name>EUR</currency_Unit.name>
        <price_Measure_Unit.name>MWH</price_Measure_Unit.name>
        <curveType>A03</curveType>
            <Period>
              <timeInterval>
                <start>2024-12-01T23:00Z</start>
                <end>2024-12-02T23:00Z</end>
              </timeInterval>
              <resolution>PT60M</resolution>
                  <Point>
                    <position>1</position>
                        <price.amount>-0.09</price.amount>
                  </Point>
                  <Point>
                    <position>2</position>
                        <price.amount>-0.15</price.amount>
                  </Point>
                  <Point>
                    <position>3</position>
                        <price.amount>-0.33</price.amount>
                  </Point>
                  <Point>
                    <position>4</position>
                        <price.amount>-0.46</price.amount>
                  </Point>
                  <Point>
                    <position>5</position>
                        <price.amount>-0.1</price.amount>
                  </Point>
                  <Point>
                    <position>6</position>
                        <price.amount>0.07</price.amount>
                  </Point>
                  <Point>
                    <position>7</position>
                        <price.amount>2.08</price.amount>
                  </Point>
                  <Point>
                    <position>8</position>
                        <price.amount>2.85</price.amount>
                  </Point>
                  <Point>
                    <position>9</position>
                        <price.amount>3.52</price.amount>
                  </Point>
                  <Point>
                    <position>10</position>
                        <price.amount>3.47</price.amount>
                  </Point>
                  <Point>
                    <position>11</position>
                        <price.amount>3.43</price.amount>
                  </Point>
                  <Point>
                    <position>12</position>
                        <price.amount>3.53</price.amount>
                  </Point>
                  <Point>
                    <position>13</position>
                        <price.amount>4.55</price.amount>
                  </Point>
                  <Point>
                    <position>14</position>
                        <price.amount>4.67</price.amount>
                  </Point>
                  <Point>
                    <position>15</position>
                        <price.amount>4.81</price.amount>
                  </Point>
                  <Point>
                    <position>16</position>
                        <price.amount>5.04</price.amount>
                  </Point>
                  <Point>
                    <position>17</position>
                        <price.amount>6.48</price.amount>
                  </Point>
                  <Point>
                    <position>18</position>
                        <price.amount>25.41</price.amount>
                  </Point>
                  <Point>
                    <position>19</position>
                        <price.amount>34.15</price.amount>
                  </Point>
                  <Point>
                    <position>20</position>
                        <price.amount>39.92</price.amount>
                  </Point>
                  <Point>
                    <position>21</position>
                        <price.amount>36.61</price.amount>
                  </Point>
                  <Point>
                    <position>22</position>
                        <price.amount>39.13</price.amount>
                  </Point>
                  <Point>
                    <position>23</position>
                        <price.amount>33.12</price.amount>
                  </Point>
                  <Point>
                    <position>24</position>
                        <price.amount>24.99</price.amount>
                  </Point>
            </Period>
      </TimeSeries>
</Publication_MarketDocument>`,
  );

});
