// Generates the ChartCortex brand asset library.
//
// The mark is a 3D render rather than flat vector, so each asset is an SVG that
// places the shared master (brand/mark.png) on a themed plate or beside the
// Chivo wordmark. Headless Chrome renders the SVG, sharp trims and exports the
// PNG (transparent) and JPEG (flattened) sizes.
//
// Run:  node brand/generate.mjs
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, "svg");
const PNG = path.join(ROOT, "png");
const JPG = path.join(ROOT, "jpg");
const TMP = path.join(ROOT, ".tmp");
const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

for (const d of [SRC, PNG, JPG, TMP]) mkdirSync(d, { recursive: true });

const MARK_URI = "../mark.png";
const FONT_URI = "../fonts/chivo-900.woff2";

const C = {
  navy: "#070B10",
  plateTop: "#16222E",
  violet: "#105BFF",
  pink: "#F355D0",
  teal: "#81FFD9",
  ink: "#EAF2F0",
  lightPlate: "#FFFFFF",
  lightPlateEnd: "#EDF1F3",
  lightBg: "#F0F0F0",
};

const STYLE = `<style>
@font-face{font-family:'Chivo';src:url('${FONT_URI}') format('woff2');font-weight:900;font-style:normal;}
.wm{font-family:'Chivo',sans-serif;font-weight:900;letter-spacing:-0.028em;}
</style>`;

const DEFS = `<defs>
  <radialGradient id="plate" cx="30%" cy="16%" r="92%">
    <stop offset="0%" stop-color="${C.plateTop}"/>
    <stop offset="100%" stop-color="${C.navy}"/>
  </radialGradient>
  <radialGradient id="plateLight" cx="30%" cy="16%" r="92%">
    <stop offset="0%" stop-color="${C.lightPlate}"/>
    <stop offset="100%" stop-color="${C.lightPlateEnd}"/>
  </radialGradient>
  <radialGradient id="glow" cx="50%" cy="42%" r="58%">
    <stop offset="0%" stop-color="rgba(16,91,255,0.35)"/>
    <stop offset="100%" stop-color="rgba(16,91,255,0)"/>
  </radialGradient>
  <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${C.teal}"/>
    <stop offset="42%" stop-color="#6E9AFF"/>
    <stop offset="72%" stop-color="#C0A6BB"/>
    <stop offset="100%" stop-color="${C.pink}"/>
  </linearGradient>
  <filter id="mshadow" x="-30%" y="-30%" width="160%" height="160%">
    <feDropShadow dx="0" dy="8" stdDeviation="16" flood-color="#000000" flood-opacity="0.5"/>
  </filter>
</defs>`;

const mark = (x, y, size, shadow = true) =>
  `<image href="${MARK_URI}" x="${x}" y="${y}" width="${size}" height="${size}"${
    shadow ? ' filter="url(#mshadow)"' : ""
  }/>`;

const wordmark = (x, y1, y2, size, anchor = "start", fillPink = C.pink) => `
  <text class="wm" x="${x}" y="${y1}" text-anchor="${anchor}" font-size="${size}" fill="${C.violet}">CHART</text>
  <text class="wm" x="${x}" y="${y2}" text-anchor="${anchor}" font-size="${size}" fill="${fillPink}">CORTEX</text>`;

const svg = (viewBox, body, w, h) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">${STYLE}${DEFS}${body}</svg>`;

// --- Mark only, on a rounded plate (favicon, avatar square, app switcher) ---
function iconSvg(light) {
  const plate = light ? "url(#plateLight)" : "url(#plate)";
  return svg(
    "0 0 1024 1024",
    `
    <rect x="30" y="30" width="964" height="964" rx="230" fill="${plate}"/>
    <rect x="30" y="30" width="964" height="964" rx="230" fill="none" stroke="url(#rim)" stroke-width="7" opacity="0.75"/>
    ${mark(232, 232, 560)}`,
    1024,
    1024,
  );
}

// --- Store icon: full bleed, opaque, no rounding ---------------------------
function appIconSvg() {
  return svg(
    "0 0 1024 1024",
    `
    <rect width="1024" height="1024" fill="${C.navy}"/>
    <rect width="1024" height="1024" fill="url(#glow)"/>
    ${mark(212, 212, 600)}`,
    1024,
    1024,
  );
}

// --- Android maskable: mark inside the 80% safe zone ----------------------
function maskableSvg() {
  return svg(
    "0 0 1024 1024",
    `
    <rect width="1024" height="1024" fill="${C.navy}"/>
    <rect width="1024" height="1024" fill="url(#glow)"/>
    ${mark(302, 302, 420)}`,
    1024,
    1024,
  );
}

// --- Launcher tile: plate, mark above the wordmark ------------------------
function tileSvg() {
  return svg(
    "0 0 1024 1024",
    `
    <rect x="24" y="24" width="976" height="976" rx="232" fill="url(#plate)"/>
    <rect x="24" y="24" width="976" height="976" rx="232" fill="none" stroke="url(#rim)" stroke-width="7" opacity="0.75"/>
    ${mark(292, 128, 440)}
    ${wordmark(512, 722, 828, 96, "middle")}`,
    1024,
    1024,
  );
}

// --- Social avatar: full circle, mark above the wordmark ------------------
function avatarSvg() {
  return svg(
    "0 0 512 512",
    `
    <circle cx="256" cy="256" r="256" fill="${C.navy}"/>
    <circle cx="256" cy="256" r="248" fill="url(#plate)"/>
    <circle cx="256" cy="256" r="248" fill="none" stroke="url(#rim)" stroke-width="5" opacity="0.8"/>
    ${mark(148, 62, 216)}
    <g class="wm">
      <text x="256" y="352" text-anchor="middle" font-size="62" fill="${C.violet}">CHART</text>
      <text x="256" y="420" text-anchor="middle" font-size="62" fill="${C.pink}">CORTEX</text>
    </g>`,
    512,
    512,
  );
}

// --- Wordmark and lockups --------------------------------------------------
function wordmarkSvg() {
  return svg(
    "0 0 1600 320",
    `<text class="wm" x="0" y="250" font-size="220"><tspan fill="${C.violet}">CHART</tspan><tspan fill="${C.pink}">CORTEX</tspan></text>`,
    1600,
    320,
  );
}

function horizontalSvg() {
  return svg(
    "0 0 1400 380",
    `${mark(0, 30, 320)}${wordmark(368, 178, 328, 150)}`,
    1400,
    380,
  );
}

function stackedSvg() {
  return svg(
    "0 0 800 900",
    `${mark(210, 0, 380)}${wordmark(400, 600, 760, 150, "middle")}`,
    800,
    900,
  );
}

// --- Asset manifest --------------------------------------------------------
const ASSETS = [
  { name: "icon-dark", type: "icon", theme: "dark", sizes: [1024, 512, 256, 128, 64, 32, 16], jpgBg: C.navy },
  { name: "icon-light", type: "icon", theme: "light", sizes: [1024, 512, 256, 128, 64, 32, 16], jpgBg: C.lightBg },
  { name: "app-icon", type: "opaque", sizes: [1024, 512, 192, 180, 167, 152, 120], jpgBg: C.navy },
  { name: "app-maskable", type: "opaque", sizes: [512], jpgBg: C.navy },
  { name: "app-tile", type: "tile", sizes: [1024, 512, 192, 180], jpgBg: C.navy },
  { name: "social-avatar", type: "tile", sizes: [1024, 512, 400, 320, 200], jpgBg: C.navy },
  { name: "wordmark-dark", type: "wide", svg: "wordmark", widths: [1600, 800, 400], jpgBg: C.navy },
  { name: "wordmark-light", type: "wide", svg: "wordmark", widths: [1600, 800, 400], jpgBg: C.lightBg },
  { name: "lockup-horizontal-dark", type: "wide", svg: "horizontal", widths: [2400, 1600, 1200, 800, 400], jpgBg: C.navy },
  { name: "lockup-horizontal-light", type: "wide", svg: "horizontal", widths: [2400, 1600, 1200, 800, 400], jpgBg: C.lightBg },
  { name: "lockup-stacked-dark", type: "wide", svg: "stacked", widths: [1024, 512, 256], jpgBg: C.navy },
  { name: "lockup-stacked-light", type: "wide", svg: "stacked", widths: [1024, 512, 256], jpgBg: C.lightBg },
];

function svgFor(asset) {
  switch (asset.type) {
    case "icon":
      return iconSvg(asset.theme === "light");
    case "opaque":
      return asset.name === "app-maskable" ? maskableSvg() : appIconSvg();
    case "tile":
      return asset.name === "social-avatar" ? avatarSvg() : tileSvg();
    case "wide":
      return { wordmark: wordmarkSvg, horizontal: horizontalSvg, stacked: stackedSvg }[asset.svg]();
    default:
      throw new Error(`unknown type ${asset.type}`);
  }
}

function render(asset) {
  const content = svgFor(asset);
  const svgPath = path.join(SRC, `${asset.name}.svg`);
  writeFileSync(svgPath, content, "utf8");

  const dims = content.match(/width="(\d+)" height="(\d+)"/);
  const w = Number(dims[1]);
  const h = Number(dims[2]);
  const out = path.join(TMP, `${asset.name}.png`);
  const scale = asset.type === "wide" ? 4 : 2;

  execFileSync(
    CHROME,
    [
      "--headless=new",
      "--disable-gpu",
      "--hide-scrollbars",
      "--no-first-run",
      `--user-data-dir=${path.join(TMP, "profile")}`,
      `--window-size=${w},${h}`,
      `--force-device-scale-factor=${scale}`,
      "--default-background-color=00000000",
      "--virtual-time-budget=3000",
      `--screenshot=${out}`,
      pathToFileURL(svgPath).href,
    ],
    { stdio: "ignore" },
  );
  return out;
}

async function build() {
  let pngCount = 0;
  let jpgCount = 0;

  for (const asset of ASSETS) {
    const base = render(asset);

    if (asset.type === "wide") {
      let trimmed = await sharp(base).trim({ threshold: 8 }).png().toBuffer();
      const meta = await sharp(trimmed).metadata();
      const pad = Math.round(Math.max(meta.width, meta.height) * 0.02);
      trimmed = await sharp(trimmed)
        .extend({
          top: pad,
          bottom: pad,
          left: pad,
          right: pad,
          background: { r: 0, g: 0, b: 0, alpha: 0 },
        })
        .png()
        .toBuffer();

      if (asset.name === "lockup-stacked-dark" || asset.name === "lockup-stacked-light") {
        const m = await sharp(trimmed).metadata();
        const side = Math.max(m.width, m.height);
        const dx = Math.round((side - m.width) / 2);
        const dy = Math.round((side - m.height) / 2);
        const inset = Math.round(side * 0.06);
        trimmed = await sharp(trimmed)
          .extend({
            top: dy + inset,
            bottom: side - m.height - dy + inset,
            left: dx + inset,
            right: side - m.width - dx + inset,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer();
      }

      for (const width of asset.widths) {
        await sharp(trimmed)
          .resize({ width })
          .png({ compressionLevel: 9 })
          .toFile(path.join(PNG, `${asset.name}-${width}.png`));
        pngCount++;
        await sharp(trimmed)
          .resize({ width })
          .flatten({ background: asset.jpgBg })
          .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
          .toFile(path.join(JPG, `${asset.name}-${width}.jpg`));
        jpgCount++;
      }
      console.log(`done: ${asset.name}`);
      continue;
    }

    const size = 1024;
    for (const target of asset.sizes) {
      if (asset.type === "opaque") {
        await sharp(base)
          .resize(target, target)
          .flatten({ background: asset.jpgBg })
          .removeAlpha()
          .png({ compressionLevel: 9 })
          .toFile(path.join(PNG, `${asset.name}-${target}.png`));
        pngCount++;
        await sharp(base)
          .resize(target, target)
          .flatten({ background: asset.jpgBg })
          .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
          .toFile(path.join(JPG, `${asset.name}-${target}.jpg`));
        jpgCount++;
        continue;
      }

      await sharp(base)
        .resize(target, target, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png({ compressionLevel: 9 })
        .toFile(path.join(PNG, `${asset.name}-${target}.png`));
      pngCount++;
      await sharp(base)
        .resize(target, target, { fit: "contain", background: asset.jpgBg })
        .flatten({ background: asset.jpgBg })
        .jpeg({ quality: 92, chromaSubsampling: "4:4:4" })
        .toFile(path.join(JPG, `${asset.name}-${target}.jpg`));
      jpgCount++;
    }
    console.log(`done: ${asset.name} (${size}px master)`);
  }

  console.log(`\nPNG: ${pngCount}  JPEG: ${jpgCount}`);
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
