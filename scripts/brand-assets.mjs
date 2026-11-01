import fs from "node:fs";
import sharp from "sharp";

const dir = "E:\\MyApps\\ChartCorex\\.design\\";
const out = "E:\\MyApps\\ChartCorex\\public\\brand\\";
fs.mkdirSync(out, { recursive: true });

const crop = dir + "logo-a-crop.png";

async function mark(size, file) {
  const inner = Math.round(size * 0.88);
  const scaled = await sharp(crop)
    .resize(inner, inner, { fit: "contain", background: "#0B0A10" })
    .png()
    .toBuffer();
  await sharp({
    create: { width: size, height: size, channels: 4, background: "#0B0A10" },
  })
    .composite([{ input: scaled, gravity: "centre" }])
    .png()
    .toFile(out + file);
}

await mark(512, "mark-512.png");
await mark(256, "mark-256.png");
await mark(64, "mark-64.png");

fs.copyFileSync(out + "mark-256.png", "E:\\MyApps\\ChartCorex\\src\\app\\icon.png");

await sharp(dir + "hero-2.png").resize(1600).webp({ quality: 84 }).toFile(out + "hero.webp");
await sharp(dir + "hero-1.png").resize(1600).webp({ quality: 82 }).toFile(out + "hero-chart.webp");

console.log("assets written");
