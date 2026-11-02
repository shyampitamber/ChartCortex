import sharp from "sharp";

const input = "E:\\MyApps\\ChartCortex\\.design\\logo-final-tall.png";
const out = "E:\\MyApps\\ChartCortex\\.design\\logo-final-fat.png";
const width = 1600;
const height = 1600;
const scaleX = 1.12;
const gap = 10;

const { data, info } = await sharp(input)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const ch = info.channels;

const isTeal = (r, g, b) =>
  g > 105 && b > 85 && g > r + 45 && b > r + 15 && g >= b - 55;
const ink = (r, g, b) => r < 245 || g < 245 || b < 245;

let cMinX = width;
let cMaxX = 0;
for (let y = 0; y < height; y += 1) {
  for (let x = Math.floor(width * 0.44); x <= Math.ceil(width * 0.58); x += 1) {
    const i = (y * width + x) * ch;
    if (!isTeal(data[i], data[i + 1], data[i + 2])) continue;
    if (x < cMinX) cMinX = x;
    if (x > cMaxX) cMaxX = x;
  }
}
const bandMin = cMinX - 4;
const bandMax = cMaxX + 4;

function bbox(xFrom, xTo) {
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  for (let y = 0; y < height; y += 1) {
    for (let x = xFrom; x < xTo; x += 1) {
      const i = (y * width + x) * ch;
      if (!ink(data[i], data[i + 1], data[i + 2])) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { minX, maxX, minY, maxY };
}

const leftBox = bbox(0, bandMin);
const rightBox = bbox(bandMax, width);
const leftW = leftBox.maxX - leftBox.minX + 1;
const rightW = rightBox.maxX - rightBox.minX + 1;
const boxH = leftBox.maxY - leftBox.minY + 1;
const newLeftW = Math.round(leftW * scaleX);
const newRightW = Math.round(rightW * scaleX);

const left = await sharp(input)
  .extract({ left: leftBox.minX, top: leftBox.minY, width: leftW, height: boxH })
  .resize({ width: newLeftW, height: boxH, fit: "fill" })
  .png()
  .toBuffer();

const right = await sharp(input)
  .extract({
    left: rightBox.minX,
    top: rightBox.minY,
    width: rightW,
    height: boxH,
  })
  .resize({ width: newRightW, height: boxH, fit: "fill" })
  .png()
  .toBuffer();

const centre = await sharp(input)
  .extract({ left: bandMin, top: 0, width: bandMax - bandMin, height })
  .png()
  .toBuffer();

const leftPos = bandMin - gap - newLeftW;
const rightPos = bandMax + gap;

await sharp({
  create: { width, height, channels: 4, background: "#ffffff" },
})
  .composite([
    { input: left, left: leftPos, top: leftBox.minY },
    { input: right, left: rightPos, top: rightBox.minY },
    { input: centre, left: bandMin, top: 0 },
  ])
  .png()
  .toFile(out);

console.log(
  JSON.stringify({
    gapBefore: { left: bandMin - leftBox.maxX, right: rightBox.minX - bandMax },
    left: { x: leftPos, width: newLeftW, right: leftPos + newLeftW },
    right: { x: rightPos, width: newRightW },
    gapAfter: { left: bandMin - (leftPos + newLeftW), right: rightPos - bandMax },
  })
);
