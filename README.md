# spot-prices

> Local 15‑minute Finnish electricity spot price API (ENTSO‑E + Elering fallback) for Home Assistant & energy automations.

## About

This project is a lightweight Node.js / TypeScript server that collects and normalizes Finnish day-ahead electricity spot prices at 15‑minute resolution. It queries the ENTSO‑E Transparency Platform (documentType A44) and, if data remains incomplete after mid‑afternoon, falls back to the Elering public API to fill gaps. Results are cached in-memory and persisted to a tiny SQLite database to survive restarts.

Use cases:

- Powering Home Assistant REST sensors & automations (shift loads to cheapest consecutive hours).
- Evaluating off‑peak / peak averages and tomorrow’s forecast once published.
- Adding transfer (distribution + taxes) components to compute effective delivered price blocks.

Design highlights:

- Deterministic expansion to 15‑minute slots even across DST (23/24/25 hour) days.
- Atomic price refresh guarded by a mutex; incremental persistence on cache updates.
- Query engine for best/worst price windows with weighting modes.
- Simple zero-dependency HTTP server (native `http` module) for minimal footprint.

---

## Data Flow Overview

1. Startup (`src/spot.ts`):
   - Validates presence of `ENTSOE_SECURITY_TOKEN` environment variable.
   - Initializes SQLite table and warms NodeCache from DB.
   - Triggers initial fetch/update.
2. Periodic updates:
   - Every minute: `rootController.updatePrices()` checks for missing time slots (yesterday, today, and (after 14:00) tomorrow’s hours). If missing, fetch window (−2h … +2h) from ENTSO-E.
   - If ENTSO-E response still incomplete after 15:00, attempts fallback to Elering.
3. Cache persistence:
   - On any cache set, `storeController.updateStoredResultWhenChanged()` merges with DB and persists de‑duplicated, sorted rows (−2 days to tomorrow 24:00).
4. Midnight:
   - Flush cache, re-hydrate from DB, refresh prices.

## Price Normalization

ENTSO-E A44 returns EUR/MWh. The `utils.getPrice()` function converts to EUR/kWh dividing by 1000 and applies VAT multiplier (constant `VAT = 1.255`) to positive prices only. Negative prices are kept without VAT increase.

## Off-Peak / Peak Definition

- Off-peak today: 22:00 (yesterday) → 07:00 (today)
- Peak today: 07:00 → 22:00 (today)
- Off-peak tomorrow: 22:00 (today) → 07:00 (tomorrow)
- Peak tomorrow: 07:00 → 22:00 (tomorrow)

## Query Modes (Endpoint `/query`)

All modes operate on a contiguous window of N hours (each hour = 4×15min slots).

- LowestAverage: Minimizes simple sum (uniform weights) of prices in the block.
- LowestWeighted: Minimizes weighted sum where earlier slots have higher weight (prefers earlier cheap periods).
- HighestAverage: Maximizes simple sum (finds most expensive block).
  When `offPeakTransferPrice` and `peakTransferPrice` are provided, each slot receives an additive transfer component based on the local hour (22–07 off-peak). Computed stats (min/max/avg) are returned both raw and with transfer.

## Endpoints

Base URL: `http://<host>:8089`

1. `/` (Root) – Returns a `PricesContainer`:

```json
{
  "info": {
    "current": "0.01567",
    "averageToday": "0.01268",
    "averageTodayOffPeak": "0.00552",
    "averageTodayPeak": "0.01701",
    "tomorrowAvailable": true,
    "averageTomorrow": "0.05151",
    "averageTomorrowOffPeak": "0.00617",
    "averageTomorrowPeak": "0.07305"
  },
  "today": [ { "start": "2025-10-22T00:15:00.000+03:00", "price": "0.00294" }, ... ],
  "tomorrow": [ { "start": "2025-10-23T00:15:00.000+03:00", "price": "0.00627" }, ... ]
}
```

2. `/query` – Parameters:
   - `queryMode=LowestAverage|LowestWeighted|HighestAverage` (required)
   - `hours=INTEGER` (1–24) (required)
   - `startTime=UNIX_SECONDS` (required)
   - `endTime=UNIX_SECONDS` (required)
   - `offPeakTransferPrice=NUMBER` (optional)
   - `peakTransferPrice=NUMBER` (optional)
     Returns:

```json
{
  "hours": { "startTime": "2025-10-22T09:00:00.000+03:00", "endTime": "2025-10-22T15:15:00.000+03:00" },
  "info": {
    "now": false,
    "min": 0.00501,
    "max": 0.02455,
    "avg": 0.01234,
    "withTransferPrices": {
      "avg": 0.04567,
      "min": 0.0339,
      "max": 0.06211
    }
  }
}
```

(When transfer prices omitted, `withTransferPrices` object is not included.)

3. `/links` – Parameters:

   - `hours=INTEGER` (optional; default 6)
   - `offPeakTransferPrice=NUMBER` (optional)
   - `peakTransferPrice=NUMBER` (optional)
     Returns structure with example `/query` URLs for today & tomorrow with and without transfer prices.

4. `/reset` – Flushes in-memory cache; re-warms from DB.
5. `/resetAll` – Drops DB table, re-creates it, flushes cache (use carefully). Returns plain "Ok".

HTTP Status Codes:

- 200 on success.
- 404 for unknown paths.

## Environment Variables

Required:

- `ENTSOE_SECURITY_TOKEN` – Personal API token from ENTSO-E Transparency Platform (see their portal under account settings).
  Optional:
- `TZ` – Time zone (docker-compose sets `Europe/Helsinki`). Must match intended market; logic assumes Finland bidding zone (`out_Domain=10YFI-1--------U`).

Can be provided via a `.env` file in project root when running locally:

```
ENTSOE_SECURITY_TOKEN=your_token_here
```

## Installation & Running

### Local (Node)

Prerequisites: Node.js >= 18

```bash
npm install
npx tsc
export ENTSOE_SECURITY_TOKEN="your_token"
node build/spot.js
```

Server listens on `http://localhost:8089`.

### Docker

Build and run directly:

```bash
docker build -t spot-prices .
docker run -d --name spot-prices -p 8089:8089 -e ENTSOE_SECURITY_TOKEN=your_token -e TZ=Europe/Helsinki spot-prices
```

SQLite data directory is symlinked to `/data` inside container; map a volume for persistence if desired.

### docker-compose

`docker-compose.yml` already provided:

```bash
export ENTSOE_SECURITY_TOKEN=your_token
docker compose up -d --build
```

Add `environment:` section variable if not specifying externally:

```yaml
environment:
  - TZ=Europe/Helsinki
  - ENTSOE_SECURITY_TOKEN=${ENTSOE_SECURITY_TOKEN}
```

## Example Queries

Get root data:

```bash
curl http://localhost:8089/
```

Find cheapest 6-hour block between yesterday 21:00 and today 21:00:

```bash
START=$(date -v-1d +%s | awk '{print $1 - ($1%3600) + 21*3600}')
END=$(date +%s | awk '{print $1 - ($1%3600) + 21*3600}')
curl "http://localhost:8089/query?queryMode=LowestAverage&hours=6&startTime=$START&endTime=$END"
```

Same with transfer prices:

```bash
curl "http://localhost:8089/query?queryMode=LowestWeighted&hours=6&startTime=$START&endTime=$END&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445"
```

Generate example links for tomorrow (once prices are available):

```bash
curl "http://localhost:8089/links?hours=8&offPeakTransferPrice=0.0274&peakTransferPrice=0.0445"
```

## Home Assistant Integration Example

Create a REST sensor in `configuration.yaml` to capture current price and averages:

```yaml
sensor:
  - platform: rest
    name: Spot Price Current
    resource: http://localhost:8089/
    value_template: '{{ value_json.info.current }}'
    unit_of_measurement: 'EUR/kWh'
    scan_interval: 300
  - platform: rest
    name: Spot Price Avg Today
    resource: http://localhost:8089/
    value_template: '{{ value_json.info.averageToday }}'
    unit_of_measurement: 'EUR/kWh'
  - platform: rest
    name: Spot Price Avg Today Peak
    resource: http://localhost:8089/
    value_template: '{{ value_json.info.averageTodayPeak }}'
    unit_of_measurement: 'EUR/kWh'
```

For a dynamic cheapest block window, use a template sensor hitting `/query` (automation could refresh periodStart/periodEnd daily).

## Persistence & Retention

`storeController` retains a rolling window (two days back to tomorrow) of 15‑minute slots in SQLite. Older slots are implicitly dropped when not included in merge set.

## Error Handling & Resilience

- Network timeouts (30s) abort ENTSO-E/Elering requests (AbortController + log).
- Missing or incomplete price sets cause retries each minute until complete.
- Mutex (`async-mutex`) ensures `updatePrices` atomicity.
- If ENTSO-E never fills missing hours by fallback time (after 15:00), Elering merge attempts proceed; remaining gaps logged and skipped.

## Time Zone & DST

All computations use Luxon with `Europe/Helsinki`. The parser calculates number of quarter slots from explicit `timeInterval` duration and expands resolutions (`PT60M`, `PT30M`, `PT15M`). DST shifts (23/24/25 hour periods) automatically adjust slot count (92/96/100 slots) so daily averages remain correct.

## Security Considerations

- No authentication or rate limiting. Intended for local network use only.
- Do not expose publicly without adding auth/restrictions.
- Keep ENTSO-E token private (use environment variable, not hard-coded).

## Testing

Jest test suite (TypeScript/ts-jest) covers parser, controllers, utilities, and query logic.
Run tests:

```bash
npm test
```

Time zone forced via script (`TZ=Europe/Helsinki jest`).

## Project Structure (Key Directories)

- `src/spot.ts` – Server entry point, cron jobs.
- `src/controller/` – Request handlers (`rootController`, `queryController`, `linksController`, `storeController`).
- `src/services/` – Query window logic (`query.ts`, `modes.ts`) and example link generator.
- `src/parser/entsoParser.ts` – ENTSO-E XML to 15‑min price rows.
- `src/utils/` – Date and price utilities.
- `data/` – SQLite DB location (symlink inside container).
- `build/` – Transpiled JavaScript after `npx tsc`.

## License

MIT License (see `LICENSE`).

## Disclaimer

This project is not affiliated with ENTSO-E or Elering. Use data responsibly; verify prices before automations with financial impact.

---

Feel free to open issues or PRs for enhancements.
