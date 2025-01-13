# Spot Prices

[![Node.js CI](https://github.com/vilellic/spot-prices/actions/workflows/node.js.yml/badge.svg)](https://github.com/vilellic/spot-prices/actions/workflows/node.js.yml)

**Spot Prices** is a Node.js application designed to fetch, cache, and serve electricity spot price data from ENTSO-E.

## Features

- **Daily Fetching**: Automatically retrieves the latest spot prices from [ENTSO-E](https://transparency.entsoe.eu/) once a day.
- **In-Memory Caching**: Stores the fetched data in memory for quick access.
- **JSON API**: Provides access to the cached data via a simple JSON API.
- **Persistent Storage**: Persists data to disk, allowing recovery of data if the application restarts or crashes.
- **Finnish Market Focus**: Currently fetches electricity prices for the Finnish market but can be extended to other markets within the ENTSO-E area.
- **Query Endpoint**: Allows for querying specific price data scenarios.

## API Endpoint

You can access the spot price data through:

```http
GET http://localhost:8089/
```

Sample Response:
```json
{
  "info": {
    "current": "0.00284",
    "averageToday": "0.01716",
    "averageTodayOffPeak": "0.04674",
    "averageTodayPeak": "0.01337",
    "tomorrowAvailable": true,
    "averageTomorrow": "0.00605",
    "averageTomorrowOffPeak": "0.00085",
    "averageTomorrowPeak": "0.00667"
  },
  "today": [
    {
      "start": "2025-01-13T00:00:00.000+02:00",
      "price": "0.05359"
    },
    {
      "start": "2025-01-13T01:00:00.000+02:00",
      "price": "0.02878"
    },
    {
      "start": "2025-01-13T02:00:00.000+02:00",
      "price": "0.03179"
    },
    {
      "start": "2025-01-13T03:00:00.000+02:00",
      "price": "0.02568"
    },
    // more entries...
  ]
}
```

### Query Endpoint

The application also includes a query endpoint for more specific data requests:

- **Example queries as links**: Available at [http://localhost:8089/links](http://localhost:8089/links).
- **Query Example**: To query for the cheapest 6 sequential hours between two timestamps:

  ```http
  GET http://localhost:8089/query?queryMode=SequentialPrices&hours=6&startTime=1736794800&endTime=1736881200
  ```
    - `queryMode=SequentialPrices`: Specifies to find sequential hours.
    - `hours=6`: Indicates 6 sequential hours are needed.
    - `startTime` and `endTime`: Unix timestamps defining the range to search within.

- Sample response:
  ```json
  {
    "hours": {
      "list": ["0 Tue", "1 Tue", "2 Tue", "3 Tue", "4 Tue", "5 Tue"],
      "start": "00",
      "end": "06",
      "startTime": "2025-01-14T00:00:00.000+02:00",
      "endTime": "2025-01-14T06:00:00.000+02:00"
    },
    "info": {
      "now": false,
      "min": 0.00011,
      "max": 0.00035,
      "avg": 0.00024
    }
  }
  ```

## Setup

### Using Docker Compose

For an easy setup, you can use Docker Compose:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vilellic/spot-prices.git
   cd spot-prices
   ```

2. **Create a .env file in the root directory with your ENTSO-E API key**:
```plaintext
ENTSOE_API_KEY=your_api_key_here
```
3. **Run Docker Compose**:
```bash
docker-compose up -d
```

This command will build the image if necessary, start the container, and run it in detached mode. 
Check if the service is running by visiting the API endpoint or checking Docker logs:
```bash
docker-compose logs -f
```

### Running Locally Without Docker
If you prefer not to use Docker:

Install dependencies:
```bash
npm install
```
Run the application:
```bash
npm start
```

## Configuration

- **Environment Variables**: Uses `.env` for configuration. Here's what you'll need to set up:

  ```plaintext
  ENTSOE_API_KEY=your_api_key_here
  ```
- [How to get Entso-E API key](https://uat-transparency.entsoe.eu/content/static_content/Static%20content/web%20api/how_to_get_security_token.html)

## Docker Compose File

Here's an example `docker-compose.yml` for your reference:

```yaml
services:
  spot-prices:
    build: .
    ports:
      - 8089:8089
    environment:
      - TZ=Europe/Helsinki
      - ENTSOE_API_KEY=${ENTSOE_API_KEY}
    volumes:
      - '/etc/timezone:/etc/timezone:ro'
      - '/etc/localtime:/etc/localtime:ro'
```

## Contributing

Contributions are welcome! Please follow these steps:

- Fork the repository
- Create your feature branch (`git checkout -b feature/AmazingFeature`)
- Commit your changes (`git commit -m 'Add some AmazingFeature'`)
- Push to the branch (`git push origin feature/AmazingFeature`)
- Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
