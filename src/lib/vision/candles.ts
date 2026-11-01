import sharp from "sharp";

export type ExtractedCandle = {
  x1: number;
  x2: number;
  top: number;
  bottom: number;
  bodyTop: number;
  bodyBottom: number;
  direction: "up" | "down";
};

export type CandleExtraction = {
  width: number;
  height: number;
  candles: ExtractedCandle[];
};

type Options = {
  minRun?: number;
  minColumnPixels?: number;
  gapTolerance?: number;
  maxWidthRatio?: number;
  bodyFill?: number;
};

function classify(r: number, g: number, b: number, a: number): "up" | "down" | null {
  if (a < 40) return null;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (max < 70 || delta < 45) return null;
  const v = max / 255;
  const s = delta / max;
  if (s < 0.35 || v < 0.25) return null;
  let h: number;
  if (max === r) h = 60 * (((g - b) / delta) % 6);
  else if (max === g) h = 60 * ((b - r) / delta + 2);
  else h = 60 * ((r - g) / delta + 4);
  if (h < 0) h += 360;
  if (h >= 70 && h <= 175) return "up";
  if (h <= 25 || h >= 335) return "down";
  return null;
}

export async function extractCandles(
  buffer: Buffer,
  options: Options = {}
): Promise<CandleExtraction> {
  const {
    minRun = 4,
    minColumnPixels = 3,
    gapTolerance = 2,
    maxWidthRatio = 0.04,
    bodyFill = 0.55,
  } = options;

  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const kind: ("up" | "down" | null)[] = new Array(width).fill(null);

  for (let x = 0; x < width; x += 1) {
    let up = 0;
    let down = 0;
    let run = 0;
    let bestRun = 0;
    for (let y = 0; y < height; y += 1) {
      const i = (y * width + x) * channels;
      const c = classify(data[i], data[i + 1], data[i + 2], data[i + 3]);
      if (c) {
        if (c === "up") up += 1;
        else down += 1;
        run += 1;
        if (run > bestRun) bestRun = run;
      } else {
        run = 0;
      }
    }
    if (up + down >= minColumnPixels && bestRun >= minRun) {
      kind[x] = up >= down ? "up" : "down";
    }
  }

  const groups: [number, number][] = [];
  let start = -1;
  let last = -1;
  let gap = 0;
  for (let x = 0; x < width; x += 1) {
    if (kind[x]) {
      if (start < 0) start = x;
      last = x;
      gap = 0;
    } else if (start >= 0) {
      gap += 1;
      if (gap > gapTolerance) {
        groups.push([start, last]);
        start = -1;
      }
    }
  }
  if (start >= 0) groups.push([start, last]);

  const candles: ExtractedCandle[] = [];
  const maxWidth = Math.max(2, Math.floor(width * maxWidthRatio));

  for (const [x1, x2] of groups) {
    const w = x2 - x1 + 1;
    if (w < 2 || w > maxWidth) continue;

    const rows = new Int32Array(height);
    const bodyThreshold = Math.max(2, Math.ceil(w * bodyFill));

    for (let y = 0; y < height; y += 1) {
      let count = 0;
      for (let x = x1; x <= x2; x += 1) {
        const i = (y * width + x) * channels;
        if (classify(data[i], data[i + 1], data[i + 2], data[i + 3])) count += 1;
      }
      rows[y] = count;
    }

    let firstBody = -1;
    let lastBody = -1;
    for (let y = 0; y < height; y += 1) {
      if (rows[y] >= bodyThreshold) {
        if (firstBody < 0) firstBody = y;
        lastBody = y;
      }
    }
    if (firstBody < 0 || lastBody - firstBody < 1) continue;

    let top = firstBody;
    let gap = 0;
    for (let y = firstBody - 1; y >= 0; y -= 1) {
      if (rows[y] >= 1) {
        top = y;
        gap = 0;
      } else {
        gap += 1;
        if (gap > 2) break;
      }
    }

    let bottom = lastBody;
    gap = 0;
    for (let y = lastBody + 1; y < height; y += 1) {
      if (rows[y] >= 1) {
        bottom = y;
        gap = 0;
      } else {
        gap += 1;
        if (gap > 2) break;
      }
    }

    if (bottom - top > height * 0.4) continue;

    let up = 0;
    let down = 0;
    for (let x = x1; x <= x2; x += 1) {
      if (kind[x] === "up") up += 1;
      else if (kind[x] === "down") down += 1;
    }

    candles.push({
      x1,
      x2,
      top,
      bottom,
      bodyTop: firstBody,
      bodyBottom: lastBody,
      direction: up >= down ? "up" : "down",
    });
  }

  return { width, height, candles };
}
