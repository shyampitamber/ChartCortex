import sharp from "sharp";
await sharp("E:\\MyApps\\ChartCortex\\.design\\logo-final-tall.png").resize(440).png().toFile("E:\\MyApps\\ChartCortex\\.design\\logo-final-tall-small.png");
