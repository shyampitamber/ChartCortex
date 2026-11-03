import sharp from "sharp";
const p = "E:\\MyApps\\ChartCortex\\.design\\prod-terminal-final.png";
await sharp(p).extract({ left: 250, top: 540, width: 180, height: 80 }).resize(720).png().toFile("E:\\MyApps\\ChartCortex\\.design\\label-left.png");
await sharp(p).extract({ left: 1030, top: 540, width: 160, height: 80 }).resize(640).png().toFile("E:\\MyApps\\ChartCortex\\.design\\label-right.png");
console.log("cropped");
