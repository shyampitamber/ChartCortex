import fs from "node:fs";
import sharp from "sharp";

const src = "E:\\MyApps\\ChartCorex\\Logo\\grok_1793624936163.jpg";
const dir = "E:\\MyApps\\ChartCorex\\.design\\";
const out = "E:\\MyApps\\ChartCorex\\public\\brand\\";

const trimmed = await sharp(src).trim({ threshold: 18 }).toBuffer();
const meta = await sharp(trimmed).metadata();
const w = meta.width ?? 800;
const h = meta.height ?? 1000;
const side = Math.max(w, h);

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

fs.copyFileSync(out + "mark-256.png", "E:\\MyApps\\ChartCorex\\src\\app\\icon.png");

await sharp(square).resize(420).png().toFile(dir + "grok-mark-preview.png");

console.log("written", w, h, side);
