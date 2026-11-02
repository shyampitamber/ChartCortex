import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { chromium } from "playwright-core";

const ROOT = "E:\\MyApps\\ChartCortex";
const OUT = path.join(ROOT, "brand");
const TMP = path.join(ROOT, ".design", "brand-masters");
for (const dir of ["png", "jpg", "svg", "fonts"]) {
  fs.mkdirSync(path.join(OUT, dir), { recursive: true });
}
fs.mkdirSync(TMP, { recursive: true });

const MARK = path.join(ROOT, ".design", "mark-transparent.png");
const SHOT = path.join(ROOT, "public", "screenshot.png");
const FONT_SRC = path.join(ROOT, "brand", "fonts", "chivo-900.woff2");

const markB64 = fs.readFileSync(MARK).toString("base64");
const shotB64 = fs.readFileSync(SHOT).toString("base64");
const fontB64 = fs.readFileSync(FONT_SRC).toString("base64");

const C = {
  navy: "#070B10",
  panel: "#0D141C",
  violet: "#105BFF",
  pink: "#F355D0",
  teal: "#81FFD9",
  ink: "#EAF2F0",
  muted: "#8FA3A6",
  light: "#F0F0F0",
  lightInk: "#0B1620",
};

const fontFace = `@font-face{font-family:Chivo;src:url(data:font/woff2;base64,${fontB64}) format('woff2');font-weight:900;font-style:normal;font-display:block}`;
const baseCss = `*{box-sizing:border-box;margin:0;padding:0}html,body{overflow:hidden}body{font-family:Chivo,system-ui,sans-serif;-webkit-font-smoothing:antialiased}`;

const browser = await chromium.launch({
  executablePath:
    "C:\\Users\\admin\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe",
  headless: true,
});
const page = await browser.newPage({ deviceScaleFactor: 1 });

async function render(name, w, h, bg, body) {
  await page.setViewportSize({ width: w, height: h });
  await page.setContent(
    `<!doctype html><html><head><style>${fontFace}${baseCss}</style></head>` +
      `<body style="width:${w}px;height:${h}px;background:${bg}">${body}</body></html>`,
    { waitUntil: "networkidle" }
  );
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(TMP, `${name}.png`) });
  return path.join(TMP, `${name}.png`);
}

const word = (color) =>
  `<span style="color:${C.violet}">CHART</span><span style="color:${
    color ?? C.pink
  }">CORTEX</span>`;

const wordmarkBody = (fs_) =>
  `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center">
    <div style="font-size:${fs_}px;font-weight:900;letter-spacing:.01em;line-height:1;white-space:nowrap">${word()}</div>
  </div>`;

const lockupBody = (markW, textPx, gap) =>
  `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:${gap}px">
    <img src="data:image/png;base64,${markB64}" style="width:${markW}px;display:block" />
    <div style="display:flex;flex-direction:column;justify-content:space-between;height:${Math.round(
      markW * 0.8
    )}px">
      <div style="font-size:${textPx}px;font-weight:900;line-height:1;letter-spacing:.01em;color:${C.violet}">CHART</div>
      <div style="font-size:${textPx}px;font-weight:900;line-height:1;letter-spacing:.01em;color:${C.pink}">CORTEX</div>
    </div>
  </div>`;

const stackedBody = (markW, textPx) =>
  `<div style="width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${Math.round(
    markW * 0.09
  )}px">
    <img src="data:image/png;base64,${markB64}" style="width:${markW}px;display:block" />
    <div style="display:flex;flex-direction:column;align-items:center;line-height:1">
      <div style="font-size:${textPx}px;font-weight:900;letter-spacing:.01em;color:${C.violet}">CHART</div>
      <div style="font-size:${textPx}px;font-weight:900;letter-spacing:.01em;color:${C.pink}">CORTEX</div>
    </div>
  </div>`;

const swatch = (hex, label, text) =>
  `<div style="flex:1;border-radius:16px;background:${hex};padding:22px;min-height:170px;display:flex;flex-direction:column;justify-content:flex-end;border:1px solid rgba(255,255,255,.12)">
    <div style="font-size:15px;font-weight:700;color:${text}">${label}</div>
    <div style="font-size:13px;color:${text};opacity:.75;margin-top:2px">${hex.toUpperCase()}</div>
  </div>`;

const paletteBody = (dark) => {
  const ink = dark ? C.ink : C.lightInk;
  const muted = dark ? C.muted : "#5F6F76";
  const sw = [
    swatch(dark ? C.navy : "#FFFFFF", "Navy", dark ? C.ink : C.lightInk),
    swatch(C.violet, "Galactic Violet", "#FFFFFF"),
    swatch(C.pink, "Bubblegum Pink", "#FFFFFF"),
    swatch(C.teal, "Teal", C.lightInk),
    swatch(C.panel, "Panel", C.ink),
  ];
  return `<div style="width:100%;height:100%;padding:80px 90px;display:flex;flex-direction:column;gap:54px;color:${ink}">
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <div>
        <div style="font-size:16px;letter-spacing:.18em;text-transform:uppercase;color:${muted}">ChartCortex</div>
        <div style="font-size:70px;font-weight:700;letter-spacing:-.02em;margin-top:14px">Brand system</div>
      </div>
      <div style="font-size:22px;color:${muted}">${dark ? "Dark default" : "Light theme"}</div>
    </div>
    <div style="display:flex;gap:20px">${sw.join("")}</div>
    <div style="display:flex;gap:60px;align-items:flex-start">
      <div style="flex:1">
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:${muted}">Type</div>
        <div style="font-size:54px;font-weight:700;margin-top:10px">Comfortaa</div>
        <div style="font-size:17px;color:${muted};margin-top:6px">Wordmark, body and interface. Rounded, friendly, legible.</div>
      </div>
      <div style="flex:1">
        <div style="font-size:13px;letter-spacing:.16em;text-transform:uppercase;color:${muted}">Rules</div>
        <div style="font-size:16px;line-height:1.6;color:${muted};margin-top:10px">Violet and pink lead. Teal is for primary buttons only. Green and red are reserved for price direction. Wordmark: Chart in violet, Cortex in pink.</div>
      </div>
    </div>
  </div>`;
};

const ogBody = `<div style="width:100%;height:100%;padding:64px 70px;display:flex;align-items:center;gap:56px;background:radial-gradient(60% 80% at 12% 10%, rgba(16,91,255,.38), transparent 62%), radial-gradient(50% 70% at 88% 90%, rgba(243,85,208,.3), transparent 62%), ${C.navy}">
  <div style="flex:1;min-width:0">
    <img src="data:image/png;base64,${markB64}" style="width:132px;display:block" />
    <div style="margin-top:30px;font-size:52px;font-weight:700;line-height:1.04;letter-spacing:-.025em;color:${C.ink}">Your chart is the input.<br><span style="color:${C.pink}">A trade plan is the output.</span></div>
    <div style="margin-top:18px;font-size:19px;color:${C.muted}">Chart image intelligence on the Meta Model API.</div>
  </div>
  <img src="data:image/png;base64,${shotB64}" style="width:520px;border-radius:14px;border:1px solid rgba(255,255,255,.16);display:block" />
</div>`;

const ogSquareBody = `<div style="width:100%;height:100%;padding:80px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;background:radial-gradient(60% 60% at 30% 20%, rgba(16,91,255,.4), transparent 62%), radial-gradient(55% 55% at 75% 80%, rgba(243,85,208,.32), transparent 62%), ${C.navy}">
  <img src="data:image/png;base64,${markB64}" style="width:300px;display:block" />
  <div style="margin-top:40px;font-size:76px;font-weight:900;letter-spacing:.01em;color:${C.ink}">CHART<span style="color:${C.pink}">CORTEX</span></div>
  <div style="margin-top:20px;font-size:28px;color:${C.muted}">Chart image intelligence</div>
</div>`;

const avatarBody = `<div style="width:100%;height:100%;display:grid;place-items:center;background:radial-gradient(55% 55% at 28% 22%, rgba(16,91,255,.45), transparent 62%), radial-gradient(55% 55% at 76% 80%, rgba(243,85,208,.35), transparent 62%), ${C.navy}">
  <img src="data:image/png;base64,${markB64}" style="width:660px;display:block" />
</div>`;

console.log("rendering masters");
const masters = {
  "wordmark-dark": await render("wordmark-dark", 3200, 900, C.navy, wordmarkBody(430)),
  "wordmark-light": await render("wordmark-light", 3200, 900, C.light, wordmarkBody(430)),
  "lockup-dark": await render("lockup-dark", 3600, 1000, C.navy, lockupBody(900, 320, 70)),
  "lockup-light": await render("lockup-light", 3600, 1000, C.light, lockupBody(900, 320, 70)),
  "stacked-dark": await render("stacked-dark", 1600, 1600, C.navy, stackedBody(720, 200)),
  "stacked-light": await render("stacked-light", 1600, 1600, C.light, stackedBody(720, 200)),
  "palette-dark": await render("palette-dark", 2000, 1250, C.navy, paletteBody(true)),
  "palette-light": await render("palette-light", 2000, 1250, C.light, paletteBody(false)),
  "og-1200": await render("og-1200", 1200, 630, C.navy, ogBody),
  "og-square-1200": await render("og-square-1200", 1200, 1200, C.navy, ogSquareBody),
  "social-avatar": await render("social-avatar", 1024, 1024, C.navy, avatarBody),
};
await browser.close();

async function exportSizes(master, name, sizes, opts = {}) {
  for (const size of sizes) {
    const resize = opts.square
      ? { width: size, height: size }
      : { width: size };
    await sharp(master).resize(resize).png().toFile(path.join(OUT, "png", `${name}-${size}.png`));
    await sharp(master)
      .resize(resize)
      .flatten({ background: opts.jpgBg ?? C.navy })
      .jpeg({ quality: 92 })
      .toFile(path.join(OUT, "jpg", `${name}-${size}.jpg`));
  }
}

console.log("exporting wordmark and lockups");
await exportSizes(masters["wordmark-dark"], "wordmark-dark", [1600, 800, 400], { jpgBg: C.navy });
await exportSizes(masters["wordmark-light"], "wordmark-light", [1600, 800, 400], { jpgBg: C.light });
await exportSizes(masters["lockup-dark"], "lockup-horizontal-dark", [2400, 1600, 800, 400], { jpgBg: C.navy });
await exportSizes(masters["lockup-light"], "lockup-horizontal-light", [2400, 1600, 800, 400], { jpgBg: C.light });
await exportSizes(masters["stacked-dark"], "lockup-stacked-dark", [1024, 512, 256], { square: true, jpgBg: C.navy });
await exportSizes(masters["stacked-light"], "lockup-stacked-light", [1024, 512, 256], { square: true, jpgBg: C.light });
await exportSizes(masters["palette-dark"], "palette-dark", [2000, 1000], { jpgBg: C.navy });
await exportSizes(masters["palette-light"], "palette-light", [2000, 1000], { jpgBg: C.light });
await exportSizes(masters["og-1200"], "og-1200", [1200], { jpgBg: C.navy });
await exportSizes(masters["og-square-1200"], "og-square-1200", [1200], { square: true, jpgBg: C.navy });
await exportSizes(masters["social-avatar"], "social-avatar", [1024, 512, 400, 320, 200], { square: true, jpgBg: C.navy });

async function iconMaster(bg, size, ratio, radius) {
  const inner = Math.round(size * ratio);
  const mark = await sharp(MARK).resize(inner, inner, { fit: "contain" }).png().toBuffer();
  const mask = Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${Math.round(
      size * radius
    )}" fill="#fff"/></svg>`
  );
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: mark, gravity: "center" }])
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();
}

console.log("icons");
const darkIcon = await iconMaster(C.navy, 1024, 0.72, 0.22);
const lightIcon = await iconMaster("#FFFFFF", 1024, 0.72, 0.22);
const darkTile = await iconMaster(C.navy, 1024, 0.72, 0);
const maskable = await iconMaster(C.navy, 1024, 0.52, 0);

async function writeIcon(buf, name, sizes, bg) {
  for (const size of sizes) {
    await sharp(buf).resize(size, size).png().toFile(path.join(OUT, "png", `${name}-${size}.png`));
    await sharp(buf)
      .resize(size, size)
      .flatten({ background: bg })
      .jpeg({ quality: 92 })
      .toFile(path.join(OUT, "jpg", `${name}-${size}.jpg`));
  }
}

await writeIcon(darkIcon, "icon-dark", [1024, 512, 256, 128, 64, 32, 16], C.navy);
await writeIcon(lightIcon, "icon-light", [1024, 512, 256, 128, 64, 32, 16], "#FFFFFF");
await writeIcon(darkIcon, "app-icon", [1024, 512, 192, 180, 167, 152, 120], C.navy);
await writeIcon(darkTile, "app-tile", [1024, 512, 192, 180], C.navy);
await writeIcon(maskable, "app-maskable", [512], C.navy);

console.log("svg");
const svgNames = {
  "wordmark-dark": "wordmark-dark",
  "wordmark-light": "wordmark-light",
  "lockup-dark": "lockup-horizontal-dark",
  "lockup-light": "lockup-horizontal-light",
  "stacked-dark": "lockup-stacked-dark",
  "stacked-light": "lockup-stacked-light",
  "palette-dark": "palette-dark",
  "palette-light": "palette-light",
  "og-1200": "og-1200",
  "og-square-1200": "og-square-1200",
  "social-avatar": "social-avatar",
};
for (const [name, master] of Object.entries(masters)) {
  const b64 = fs.readFileSync(master).toString("base64");
  fs.writeFileSync(
    path.join(OUT, "svg", `${svgNames[name] ?? name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><image href="data:image/png;base64,${b64}" width="100" height="100" preserveAspectRatio="xMidYMid meet"/></svg>`
  );
}
for (const name of ["icon-dark", "icon-light", "app-icon", "app-tile", "app-maskable"]) {
  const file = path.join(OUT, "png", `${name}-512.png`);
  if (!fs.existsSync(file)) continue;
  const b64 = fs.readFileSync(file).toString("base64");
  fs.writeFileSync(
    path.join(OUT, "svg", `${name}.svg`),
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><image href="data:image/png;base64,${b64}" width="512" height="512"/></svg>`
  );
}

for (const [from, to] of [["og-1200-1200", "og-1200"], ["og-square-1200-1200", "og-square-1200"]]) {
  for (const ext of ["png", "jpg"]) {
    const a = path.join(OUT, ext, `${from}.${ext}`);
    const b = path.join(OUT, ext, `${to}.${ext}`);
    if (fs.existsSync(a)) fs.renameSync(a, b);
  }
}
console.log("done");
