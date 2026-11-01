import fs from "node:fs";
import sharp from "sharp";
const dir = "E:\\MyApps\\ChartCorex\\.design\\";
const out = "E:\\MyApps\\ChartCorex\\public\\brand\\";
const src = dir + "logo-v2-c.png";
for (const size of [512, 256, 64]) {
  await sharp(src).resize(size, size, { fit: "cover" }).png().toFile(out + `mark-${size}.png`);
}
fs.copyFileSync(out + "mark-256.png", "E:\\MyApps\\ChartCorex\\src\\app\\icon.png");
console.log("mark assets rebuilt");
