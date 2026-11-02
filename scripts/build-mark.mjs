import fs from "node:fs";
import sharp from "sharp";

const src = "E:\\MyApps\\ChartCortex\\.design\\logo-final-fat.png";
const out = "E:\\MyApps\\ChartCortex\\public\\brand\\";

const trimmed = await sharp(src).trim({ threshold: 18 }).toBuffer();
const meta = await sharp(trimmed).metadata();
const w = meta.width ?? 800;
const h = meta.height ?? 1000;
const side = Math.round(Math.max(w, h) * 1.12);

const square = await sharp(trimmed)
  .extend({
    top: Math.round((side - h) / 2),
    bottom: Math.round((side - h) / 2),
    left: Math.round((side - w) / 2),
    right: Math.round((side - w) / 2),
    background: "#ffffff",
  })
  .png()
  .toBuffer();

for (const size of [512, 256, 64]) {
  await sharp(square)
    .resize(size, size, { fit: "contain", background: "#ffffff" })
    .png()
    .toFile(out + `mark-${size}.png`);
}

fs.copyFileSync(out + "mark-256.png", "E:\\MyApps\\ChartCortex\\src\\app\\icon.png");

console.log("built", w, h, side);
