import sharp from "sharp";
await sharp("E:\\MyApps\\ChartCorex\\public\\media\\demo-poster.jpg").png().toFile("E:\\MyApps\\ChartCorex\\public\\screenshot.png");
console.log("screenshot updated");
