import sharp from "sharp";
const src = "E:\\MyApps\\ChartCortex\\.design\\mark-transparent.png";
for (const size of [512, 256, 64]) {
  await sharp(src).resize(size, size, { fit: "contain" }).png().toFile(`E:\\MyApps\\ChartCortex\\public\\brand\\mark-t-${size}.png`);
}
await sharp("E:\\MyApps\\ChartCortex\\brand\\png\\app-icon-512.png").resize(256, 256).png().toFile("E:\\MyApps\\ChartCortex\\src\\app\\icon.png");
await sharp("E:\\MyApps\\ChartCortex\\brand\\png\\og-1200.png").png().toFile("E:\\MyApps\\ChartCortex\\public\\og.png");
console.log("integrated");
