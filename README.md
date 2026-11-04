# ChartCortex

**Built from scratch during the Meta Global AI Developer Hackathon, 1 to 4 November 2026.** Every commit, screen and asset in this repository was created inside the hackathon window. Nothing pre-existing is included: no earlier codebase, no reused UI. The founder's separate education business is context only and contributes no code and no product features.

Live chart intelligence on the Meta Model API. Select an asset and timeframe, and receive a complete trade structure: entry zone, stop loss, three take profits, confidence, market structure and reasoning.

Decision support and education only. No execution, no client funds, no signal group.

This build uses Meta models exclusively: `sam-3.1` and `muse-spark-1.3` through the Meta Model API. There is no model-provider SDK in the project; the app calls the endpoint directly with `fetch`.

![ChartCortex terminal](public/screenshot.png)

## What is in this build

- The live OANDA market data feed, with asset and timeframe selection.
- The live candlestick chart, rendered with lightweight-charts in the brand colours.
- The Meta-native pipeline: SAM 3.1 segmentation, measured OHLC geometry, and a Muse Spark plan constrained by a JSON schema.
- The interface, brand system, landing page and deployment on Vercel, Supabase and a public GitHub repository.

## How it works

1. `GET /api/market/candles` fetches OHLC candles from OANDA for the selected instrument and timeframe.
2. The terminal renders those candles live.
3. On Analyse, the chart image is sent to `sam-3.1` over `/v1/responses`; SAM segments the chart panel and its visible objects.
4. `src/lib/market/geometry.ts` measures candle structure from the OHLC data: swing highs and lows, clustered support and resistance, and the trend.
5. `muse-spark-1.3` reads the chart image together with that measured geometry and returns JSON constrained by `src/lib/schema/plan.ts`.

Reasoning runs at `reasoning.effort: "low"` with an 8000 token output budget. A live scan takes about 17 to 22 seconds: roughly 1.3 seconds of segmentation, under a second of geometry, and 15 to 20 seconds of reasoning.

Every result exposes the Meta response IDs for the segmentation and reasoning calls, so API usage is verifiable in the product.

## API

`GET /api/market/candles?instrument=XAUUSD&timeframe=H1&count=320`

`POST /api/analyze`

```json
{
  "imageBase64": "<chart snapshot without the data prefix>",
  "mimeType": "image/jpeg",
  "imageWidth": 1600,
  "imageHeight": 900,
  "instrument": "XAUUSD",
  "timeframe": "H1",
  "candles": [{ "time": 1762000000, "open": 3900, "high": 3906, "low": 3897, "close": 3903, "volume": 5100 }]
}
```

The `candles` array drives the measured geometry. The image drives SAM and Muse vision.

## Run locally

Judges do not need keys. The production deployment at `https://chartcortex.vercel.app/scan` runs the full pipeline end to end. The keys below are only needed to run it locally.

```powershell
Copy-Item .env.local.example .env.local
# add MODEL_API_KEY, OANDA_API_KEY and OANDA_BASE_URL
npm run dev
```

Open `http://localhost:3000` for the landing page and `/scan` for the terminal.

Use the OANDA host that matches the token: `https://api-fxpractice.oanda.com` for a practice account, `https://api-fxtrade.oanda.com` for a live account.

## Limits

- OANDA-supported instruments only: forex majors, metals, indices and energies. OANDA does not serve crypto.
- `maxDuration` is 60s. A typical live scan is 17 to 22 seconds.
- The chart is analysed on demand. There is no background monitoring.
- Structured output is enforced by the schema in `src/lib/schema/plan.ts`, not by post-processing.
- No em dashes in user-facing copy.

## Brand

The mark is a 3D render of two brain hemispheres, navy on the left and pink on the right, with a teal candle between them. The candle is centred with equal overhang and stands taller than the brain. The wordmark is Chivo Black, uppercase, CHART in violet `#105BFF` stacked above CORTEX in pink `#F355D0`.

The complete export set, with PNG, JPG and SVG at every size, is in `brand/`, documented in `brand/brand.md`.

Palette: violet and pink lead. Navy `#070B10` and `#0D141C` surfaces, teal `#81FFD9` reserved for primary buttons with black text, and green and red kept exclusively for price direction. Buttons are rectangular with a 12px radius. Chivo sets the wordmark, headings, menu items and buttons; Comfortaa sets body copy. Dark is the default theme, with light available from the header toggle.

## Deployment

- GitHub: https://github.com/shyampitamber/ChartCortex (public, shared with Meta for judging)
- Production: https://chartcortex.vercel.app
- Supabase: project ref `zdrkmddaytryrduqqxqm`, Central EU (Frankfurt)
- Vercel environment: `MODEL_API_KEY`, `OANDA_API_KEY`, `OANDA_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Pushes to `main` deploy automatically through the Vercel Git integration
