import sharp from "sharp";
const m = "E:\\MyApps\\ChartCorex\\.design\\brand-masters\\lockup-light.png";
await sharp(m).resize({ width: 2400 }).png().toFile("E:\\MyApps\\ChartCorex\\brand\\png\\lockup-horizontal-light-2400.png");
await sharp(m).resize({ width: 2400 }).jpeg({ quality: 92 }).toFile("E:\\MyApps\\ChartCorex\\brand\\jpg\\lockup-horizontal-light-2400.jpg");
console.log("ok");
