export type ChartBox = {
  ordinal: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  w: number;
  h: number;
};

export type NormalizedBox = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type DetectedLevel = {
  y: number;
  type: "support" | "resistance";
  touches: number;
};

export type ChartGeometry = {
  candleCount: number;
  trend: "Up" | "Down" | "Sideways";
  slopePct: number;
  rangeHigh: number;
  rangeLow: number;
  swingHighs: number;
  swingLows: number;
  levels: DetectedLevel[];
  boxes: NormalizedBox[];
};

export type SegmentationResult = {
  model: string;
  prompt: string;
  objects: number;
  durationMs: number;
  rawLength: number;
  boxes: ChartBox[];
  region: ChartBox | null;
  requestId: string | null;
};

export type AnalysisTimings = {
  segmentMs: number;
  reasonMs: number;
  totalMs: number;
};

export type AnalysisModels = {
  sam: string;
  muse: string;
};

export type AnalyzeResponse = {
  plan: import("./schema/plan").TradePlan;
  segmentation: SegmentationResult;
  geometry: ChartGeometry;
  timings: AnalysisTimings;
  models: AnalysisModels;
  requests: {
    sam: string | null;
    muse: string | null;
  };
  mocked: boolean;
};
