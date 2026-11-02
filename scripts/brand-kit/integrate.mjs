import sharp from "sharp";
const src = "E:\\MyApps\\ChartCorex\\.design\\mark-transparent.png";
for (const size of [512, 256, 64]) {
  await sharp(src).resize(size, size, { fit: "contain" }).png().toFile(`E:\\MyApps\\ChartCorex\\public\\brand\\mark-t-${size}.png`);
}
await sharp("E:\\MyApps\\ChartCorex\\brand\\png\\app-icon-512.png").resize(256, 256).png().toFile("E:\\MyApps\\ChartCorex\\src\\app\\icon.png");
await sharp("E:\\MyApps\\ChartCorex\\brand\\png\\og-1200.png").png().toFile("E:\\MyApps\\ChartCorex\\public\\og.png");
console.log("integrated");
