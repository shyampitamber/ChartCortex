import sharp from "sharp";

const input = "E:\\MyApps\\ChartCorex\\.design\\logo-centred-b.png";
const out = "E:\\MyApps\\ChartCorex\\.design\\logo-centred-final.png";

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;

const isTeal = (r, g, b) =>
  g > 105 && b > 85 && g > r + 45 && b > r + 15 && g >= b - 55;
const ink = (r, g, b) => r < 245 || g < 245 || b < 245;

let cMinX = width;
let cMaxX = 0;
let cMinY = height;
let cMaxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (x < width * 0.44 || x > width * 0.58) continue;
    const i = (y * width + x) * channels;
    if (!isTeal(data[i], data[i + 1], data[i + 2])) continue;
    if (x < cMinX) cMinX = x;
    if (x > cMaxX) cMaxX = x;
    if (y < cMinY) cMinY = y;
    if (y > cMaxY) cMaxY = y;
  }
}

const bandMin = cMinX - 4;
const bandMax = cMaxX + 4;

let bMinY = height;
let bMaxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (x >= bandMin && x <= bandMax) continue;
    const i = (y * width + x) * channels;
    if (!ink(data[i], data[i + 1], data[i + 2])) continue;
    if (y < bMinY) bMinY = y;
    if (y > bMaxY) bMaxY = y;
  }
}

const dy = Math.round((cMinY + cMaxY) / 2 - (bMinY + bMaxY) / 2);
const target = Buffer.alloc(width * height * channels, 255);

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (!ink(r, g, b)) continue;

    const inBand = x >= bandMin && x <= bandMax;
    const ny = inBand ? y : y + dy;
    if (ny < 0 || ny >= height) continue;

    const j = (ny * width + x) * channels;
    target[j] = r;
    target[j + 1] = g;
    target[j + 2] = b;
    target[j + 3] = 255;
  }
}

await sharp(target, { raw: { width, height, channels } }).png().toFile(out);

console.log(
  JSON.stringify({
    dy,
    band: { min: bandMin, max: bandMax },
    brain: { top: bMinY + dy, bottom: bMaxY + dy },
    candle: { top: cMinY, bottom: cMaxY },
    overhangAbove: bMinY + dy - cMinY,
    overhangBelow: cMaxY - (bMaxY + dy),
  })
);
