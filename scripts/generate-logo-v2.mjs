import fs from "node:fs";

const base = process.env.META_BASE_URL || "https://api.meta.ai/v1";
const key = process.env.MODEL_API_KEY;
const dir = "E:\\MyApps\\ChartCorex\\.design\\";
const src = fs.readFileSync(dir + "logo-a.png").toString("base64");
const imageUrl = `data:image/png;base64,${src}`;

const shared =
  "Recolour and extend the brain icon. Left hemisphere galactic violet #552FF6. Right hemisphere bubblegum pink #F355D0. The central candlestick is marshmallow white #F0F0F0 and must be clearly taller than the brain, extending well above the crown and well below the base. Keep the existing brain silhouette and fold lines. Flat 2D vector, crisp edges, no 3D, no bevel, no glow, no drop shadow, no text, centred with generous margins.";

const jobs = [
  {
    file: "logo-v2-a.png",
    prompt: `${shared} Use a flat marshmallow white #F0F0F0 background. Give the white candle a thin dark charcoal outline (#16121F) so it remains visible against the white background.`,
  },
  {
    file: "logo-v2-b.png",
    prompt: `${shared} Use a flat marshmallow white #F0F0F0 background. Give the white candle a thin violet outline (#552FF6).`,
  },
  {
    file: "logo-v2-c.png",
    prompt: `${shared} Place the icon on a rounded dark charcoal tile (#16121F) with even padding, and keep the candle pure marshmallow white with no outline.`,
  },
];

for (const job of jobs) {
  const started = Date.now();
  const response = await fetch(`${base}/images/edits`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: "muse-image-1.0",
      prompt: job.prompt,
      images: [{ image_url: imageUrl }],
      n: 1,
      size: "1024x1024",
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
    console.log(`${job.file} FAILED ${response.status} ${text.slice(0, 240)}`);
    continue;
  }
  const data = JSON.parse(text);
  const b64 = data?.data?.[0]?.b64_json;
  if (!b64) {
    console.log(`${job.file} no image`);
    continue;
  }
  fs.writeFileSync(dir + job.file, Buffer.from(b64, "base64"));
  console.log(`${job.file} ok ${Date.now() - started}ms`);
}
