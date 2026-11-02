import sharp from "sharp";
await sharp("E:\\MyApps\\ChartCorex\\.design\\logo-final-tall.png").resize(440).png().toFile("E:\\MyApps\\ChartCorex\\.design\\logo-final-tall-small.png");
