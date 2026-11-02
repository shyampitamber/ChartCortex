import sharp from "sharp";
await sharp("E:\\MyApps\\ChartCortex\\public\\media\\demo-poster.jpg").png().toFile("E:\\MyApps\\ChartCortex\\public\\screenshot.png");
console.log("screenshot updated");
