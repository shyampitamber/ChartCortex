import sharp from "sharp";
const m = "E:\\MyApps\\ChartCortex\\.design\\brand-masters\\lockup-light.png";
await sharp(m).resize({ width: 2400 }).png().toFile("E:\\MyApps\\ChartCortex\\brand\\png\\lockup-horizontal-light-2400.png");
await sharp(m).resize({ width: 2400 }).jpeg({ quality: 92 }).toFile("E:\\MyApps\\ChartCortex\\brand\\jpg\\lockup-horizontal-light-2400.jpg");
console.log("ok");
