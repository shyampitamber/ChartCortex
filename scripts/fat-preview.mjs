import sharp from "sharp";
await sharp("E:\\MyApps\\ChartCortex\\.design\\logo-final-fat.png").resize(440).png().toFile("E:\\MyApps\\ChartCortex\\.design\\logo-final-fat-small.png");
