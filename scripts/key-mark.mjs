import sharp from "sharp";

const src = "E:\\MyApps\\ChartCorex\\.design\\logo-final-fat.png";
const out = "E:\\MyApps\\ChartCorex\\.design\\mark-transparent.png";

const { data, info } = await sharp(src)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const nearWhite = (i) =>
  data[i] >= 236 && data[i + 1] >= 236 && data[i + 2] >= 236;

const bg = new Uint8Array(width * height);
const stack = [];

const push = (x, y) => {
  const p = y * width + x;
  if (bg[p]) return;
  const i = p * channels;
  if (!nearWhite(i)) return;
  bg[p] = 1;
  stack.push(p);
};

for (let x = 0; x < width; x += 1) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y += 1) {
  push(0, y);
  push(width - 1, y);
}

while (stack.length) {
  const p = stack.pop();
  const x = p % width;
  const y = (p - x) / width;
  if (x > 0) push(x - 1, y);
  if (x < width - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < height - 1) push(x, y + 1);
}

for (let p = 0; p < width * height; p += 1) {
  if (bg[p]) data[p * channels + 3] = 0;
}

await sharp(data, { raw: { width, height, channels } }).png().toFile(out);

const mark = await sharp(out).resize(520).png().toBuffer();
await sharp({
  create: { width: 640, height: 640, channels: 4, background: "#070b10" },
})
  .composite([{ input: mark, gravity: "center" }])
  .png()
  .toFile("E:\\MyApps\\ChartCorex\\.design\\mark-on-navy.png");

console.log("flood keyed");
