import { z } from "zod";

export const tradePlanSchema = z.strictObject({
  instrument: z.string().describe("Symbol as read from the chart, or the supplied instrument"),
  timeframe: z.string().describe("Timeframe as read from the chart, or the supplied timeframe"),
  chartType: z.enum([
    "Candlestick",
    "Bar",
    "Line",
    "Heikin Ashi",
    "Renko",
    "Unknown",
  ]),
  priceScaleVisible: z
    .boolean()
    .describe("True only if price axis labels are legible in the image"),
  bias: z.enum(["Bullish", "Bearish", "Neutral"]),
  signalType: z.enum(["Trade", "Advisory"]),
  confidence: z.number().int().min(10).max(92),
  riskLevel: z.enum(["Low", "Medium", "High"]),
  summary: z.string().describe("Three to four sentences, no markdown"),
  trend: z.enum(["Uptrend", "Downtrend", "Ranging", "Transition"]),
  marketStructure: z.strictObject({
    recentBos: z.string().describe("Most recent break of structure with a price"),
    recentChoch: z.string().describe("Most recent change of character with a price"),
    liquidityNotes: z.string().describe("Equal highs or lows, sweeps, obvious stops"),
  }),
  keyLevels: z.strictObject({
    support: z.number(),
    resistance: z.number(),
    confluent: z.number(),
    pivot: z.number().nullable(),
    orderBlock: z.string().nullable(),
    fairValueGap: z.string().nullable(),
    liquidityPool: z.number().nullable(),
  }),
  entryZone: z.strictObject({
    low: z.number(),
    high: z.number(),
  }),
  stopLoss: z.number(),
  takeProfits: z
    .array(
      z.strictObject({
        price: z.number(),
        label: z.string(),
        rationale: z.string(),
      })
    )
    .length(3),
  riskReward: z.number(),
  tradeManagement: z.string(),
  devilsAdvocate: z.strictObject({
    counterThesis: z.string(),
    invalidation: z.string(),
    whyTakeIt: z.string(),
  }),
  primaryDriver: z.string(),
  scenarioIfWrong: z.string(),
  assumptions: z.array(z.string()).describe("What could not be read from the image"),
  disclaimer: z.string(),
});

export type TradePlan = z.infer<typeof tradePlanSchema>;

export const tradePlanJsonSchema = z.toJSONSchema(tradePlanSchema, {
  io: "output",
});

export const PLAN_SCHEMA_NAME = "ChartCortexTradePlan";
