import sharp from "sharp";

const input = "E:\\MyApps\\ChartCorex\\.design\\logo-centred-final.png";
const out = "E:\\MyApps\\ChartCorex\\.design\\logo-final-tall.png";

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
let bMinY = height;
let bMaxY = 0;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    const i = (y * width + x) * channels;
    if (x >= width * 0.44 && x <= width * 0.58 && isTeal(data[i], data[i + 1], data[i + 2])) {
      if (x < cMinX) cMinX = x;
      if (x > cMaxX) cMaxX = x;
      if (y < cMinY) cMinY = y;
      if (y > cMaxY) cMaxY = y;
    }
  }
}

const bandMin = cMinX - 4;
const bandMax = cMaxX + 4;

for (let y = 0; y < height; y += 1) {
  for (let x = 0; x < width; x += 1) {
    if (x >= bandMin && x <= bandMax) continue;
    const i = (y * width + x) * channels;
    if (!ink(data[i], data[i + 1], data[i + 2])) continue;
    if (y < bMinY) bMinY = y;
    if (y > bMaxY) bMaxY = y;
  }
}

const brainHeight = bMaxY - bMinY;
const brainCentre = (bMinY + bMaxY) / 2;
const candleCentre = (cMinY + cMaxY) / 2;
const overhang = Math.round(Math.abs(bMinY - cMinY) / 2);
const targetHeight = Math.round(cMaxY - cMinY - overhang * 2);

const left = await sharp(input)
  .extract({ left: 0, top: bMinY, width: bandMin, height: brainHeight })
  .resize({ width: bandMin, height: targetHeight, fit: "fill" })
  .png()
  .toBuffer();

const right = await sharp(input)
  .extract({
    left: bandMax,
    top: bMinY,
    width: width - bandMax,
    height: brainHeight,
  })
  .resize({ width: width - bandMax, height: targetHeight, fit: "fill" })
  .png()
  .toBuffer();

const centre = await sharp(input)
  .extract({ left: bandMin, top: 0, width: bandMax - bandMin, height })
  .png()
  .toBuffer();

const top = Math.round(brainCentre - targetHeight / 2);

await sharp({
  create: { width, height, channels: 4, background: "#ffffff" },
})
  .composite([
    { input: left, left: 0, top },
    { input: right, left: bandMax, top },
    { input: centre, left: bandMin, top: 0 },
  ])
  .png()
  .toFile(out);

console.log(
  JSON.stringify({
    brainBefore: { top: bMinY, bottom: bMaxY, height: brainHeight },
    brainAfter: { top, bottom: top + targetHeight, height: targetHeight },
    candle: { top: cMinY, bottom: cMaxY, centre: candleCentre },
    overhangAfter: { above: top - cMinY, below: cMaxY - (top + targetHeight) },
  })
);
