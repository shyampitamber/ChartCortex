import fs from "node:fs";
import path from "node:path";

const base = process.env.META_BASE_URL || "https://api.meta.ai/v1";
const key = process.env.MODEL_API_KEY;
if (!key) throw new Error("MODEL_API_KEY missing");

const outDir = "E:\\MyApps\\ChartCorex\\.design";
fs.mkdirSync(outDir, { recursive: true });

const baseStyle =
  "flat 2D vector app icon, crisp geometric edges, no text, no letters, no words, no 3D, no bevel, no glow, no drop shadow, no gradient, no mockup, no device frame, centred composition, generous margins, solid dark background colour #0B0A10";

const jobs = [
  {
    file: "logo-a.png",
    prompt: `Minimal app icon: two symmetrical stylised brain hemispheres in solid marshmallow white (#EEECEF), separated by a single vertical candlestick. The candle body is violet (#552FF6) and the wick is pink (#F355D0). The candle sits in the central fissure between the hemispheres and extends slightly above and below them. ${baseStyle}`,
  },
  {
    file: "logo-b.png",
    prompt: `Minimal app icon: one solid marshmallow white (#EEECEF) brain silhouette on a dark background, with a candlestick cut out of the centre as negative space so the background shows through. The cut-out candle body is filled violet (#552FF6) and the wick pink (#F355D0). Strong silhouette, readable at tiny sizes. ${baseStyle}`,
  },
  {
    file: "logo-c.png",
    prompt: `Minimal app icon: a brain built from vertical candlestick bars. Left hemisphere bars are marshmallow white (#EEECEF), right hemisphere bars are violet (#552FF6), and one central bar is pink (#F355D0). Bars of different heights form the brain outline, like a chart. ${baseStyle}`,
  },
  {
    file: "logo-d.png",
    prompt: `Minimal app icon: a single continuous white line drawing of a brain in profile, split by a tall candlestick in the centre. The candle body is violet (#552FF6), the wick pink (#F355D0), and the line weight is even and confident. Editorial, precise, not cute. ${baseStyle}`,
  },
  {
    file: "hero-1.png",
    prompt:
      "Wide cinematic hero image for a trading analysis product. An abstract dark scene where a candlestick chart rises from the left and resolves into the folds of a human brain on the right. Deep near-black background #0B0A10, violet #552FF6 and pink #F355D0 light accents, subtle volumetric haze, sharp focus, premium, editorial, no text, no logos, no charts with numbers, no people, no mockups.",
  },
  {
    file: "hero-2.png",
    prompt:
      "Wide abstract hero image: a three dimensional translucent brain made of thin violet light filaments, with a single pink candlestick of light passing vertically through its centre. Extreme dark background, minimal, high contrast, elegant, no text, no logos, no people.",
  },
];

for (const job of jobs) {
  const started = Date.now();
  const response = await fetch(`${base}/images/generations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "muse-image-1.0",
      prompt: job.prompt,
      n: 1,
      size: job.file.startsWith("hero") ? "1792x1024" : "1024x1024",
      response_format: "b64_json",
      output_format: "png",
      reasoning_strength: "low",
      tool_enablement: {
        enable_image_search: false,
        enable_web_search: false,
        enable_shell: false,
      },
    }),
  });

  const text = await response.text();
  if (!response.ok) {
    console.log(`${job.file} FAILED ${response.status} ${text.slice(0, 300)}`);
    continue;
  }
  const data = JSON.parse(text);
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    console.log(`${job.file} no image in response`);
    continue;
  }
  const target = path.join(outDir, job.file);
  fs.writeFileSync(target, Buffer.from(b64, "base64"));
  console.log(
    `${job.file} ok ${(fs.statSync(target).size / 1024).toFixed(0)}KB ${Date.now() - started}ms usage=${JSON.stringify(data.usage)}`
  );
}
