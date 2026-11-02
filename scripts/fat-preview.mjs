import sharp from "sharp";
await sharp("E:\\MyApps\\ChartCorex\\.design\\logo-final-fat.png").resize(440).png().toFile("E:\\MyApps\\ChartCorex\\.design\\logo-final-fat-small.png");
