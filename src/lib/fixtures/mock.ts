import type { ChartGeometry } from "../types";
import type { TradePlan } from "../schema/plan";

export function mockGeometry(): ChartGeometry {
  const boxes = Array.from({ length: 48 }, (_, i) => {
    const x = 0.04 + (i / 48) * 0.92;
    const drift = 0.62 - (i / 48) * 0.26;
    const wave = Math.sin(i / 3.1) * 0.035;
    const height = 0.018 + Math.abs(Math.sin(i / 2.3)) * 0.02;
    const center = drift + wave;
    return {
      x: Math.round(x * 10000) / 10000,
      y: Math.round((center - height / 2) * 10000) / 10000,
      w: Math.round((0.92 / 48) * 0.62 * 10000) / 10000,
      h: Math.round(height * 10000) / 10000,
    };
  });

  return {
    candleCount: boxes.length,
    trend: "Up",
    slopePct: -0.26,
    rangeHigh: 0.26,
    rangeLow: 0.8,
    swingHighs: 2,
    swingLows: 2,
    levels: [
      { y: 0.32, type: "resistance", touches: 3 },
      { y: 0.58, type: "support", touches: 2 },
      { y: 0.74, type: "support", touches: 3 },
    ],
    boxes,
  };
}

export function mockPlan(instrument: string, timeframe: string): TradePlan {
  return {
    instrument: instrument || "XAUUSD",
    timeframe: timeframe || "H1",
    chartType: "Candlestick",
    priceScaleVisible: true,
    bias: "Bullish",
    signalType: "Trade",
    confidence: 63,
    riskLevel: "Medium",
    summary:
      "Gold is holding a sequence of higher lows above the prior session pivot. The last break of structure was to the upside and price is retesting the breakout shelf. Momentum and participation agree, so the plan buys the retest rather than the extension.",
    trend: "Uptrend",
    marketStructure: {
      recentBos: "Bullish break of structure through 4,238.50",
      recentChoch: "No change of character visible on this timeframe",
      liquidityNotes: "Equal lows at 4,214.00 remain an unmitigated pool",
    },
    keyLevels: {
      support: 4222.4,
      resistance: 4248.6,
      confluent: 4234.1,
      pivot: 4231.8,
      orderBlock: "4,225.00 to 4,229.50",
      fairValueGap: "4,236.20 to 4,239.80",
      liquidityPool: 4214.0,
    },
    entryZone: { low: 4232.6, high: 4236.4 },
    stopLoss: 4224.3,
    takeProfits: [
      { price: 4243.2, label: "TP1", rationale: "Prior intraday high" },
      { price: 4248.6, label: "TP2", rationale: "Range resistance" },
      { price: 4256.0, label: "TP3", rationale: "Round number magnet" },
    ],
    riskReward: 2.1,
    tradeManagement:
      "Move the stop to entry after TP1 fills, trail to TP1 after TP2, and close at TP3.",
    devilsAdvocate: {
      counterThesis:
        "A failure back below 4,231.80 would signal the breakout was a liquidity sweep.",
      invalidation: "Any hourly close below 4,224.30 invalidates the setup.",
      whyTakeIt:
        "The retest is holding above the breakout shelf with expanding participation.",
    },
    primaryDriver:
      "Higher low sequence into a breakout retest with the daily pivot as support.",
    scenarioIfWrong:
      "If price closes below the stop, stand aside and reassess around 4,214.00.",
    assumptions: [
      "Mock fixture. Replace by running with MODEL_API_KEY set.",
      "Economic calendar events are not part of this analysis.",
    ],
    disclaimer:
      "Decision support and education only. Not financial advice. No execution and no client funds.",
  };
}
