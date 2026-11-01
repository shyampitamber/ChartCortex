import fs from "node:fs";

const base = process.env.META_BASE_URL || "https://api.meta.ai/v1";
const key = process.env.MODEL_API_KEY;
const dir = "E:\\MyApps\\ChartCorex\\.design\\";
const src = fs.readFileSync(dir + "logo-a.png").toString("base64");
const imageUrl = `data:image/png;base64,${src}`;

const shared =
  "Recolour this brain icon. Left hemisphere galactic violet #552FF6. Right hemisphere bubblegum pink #F355D0. The central candlestick is solid black #111111 and is clearly taller than the brain, extending well above the crown and well below the base. Pure white #FFFFFF background. No outline around the mark, no border, no tile, no frame, no shadow. Keep the brain silhouette. Flat 2D vector, crisp edges, no 3D, no glow, no text, centred with even margins.";

const jobs = [
  {
    file: "logo-v3-a.png",
    prompt: `${shared} Show the brain folds as thin lines in a darker shade of each hemisphere's own colour, violet folds on the violet side and deep rose folds on the pink side.`,
  },
  {
    file: "logo-v3-b.png",
    prompt: `${shared} Render the two hemispheres as clean flat silhouettes with no internal fold lines, for maximum clarity at small sizes.`,
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
    console.log(`${job.file} FAILED ${response.status} ${text.slice(0, 200)}`);
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
