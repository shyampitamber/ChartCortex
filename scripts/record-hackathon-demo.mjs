import fs from "node:fs";
import { chromium } from "playwright-core";

const exe =
  "C:\\Users\\admin\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe";
const dir = "E:\\MyApps\\ChartCortex\\.design\\video-hack";
fs.mkdirSync(dir, { recursive: true });
for (const file of fs.readdirSync(dir)) {
  if (file.endsWith(".webm")) fs.rmSync(dir + "\\" + file);
}

const browser = await chromium.launch({ executablePath: exe, headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir, size: { width: 1440, height: 900 } },
  colorScheme: "dark",
});

const page = await context.newPage();
const base = "https://chartcortex.vercel.app";

await page.goto(base + "/", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(6000);

await page.goto(base + "/scan", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(6000);

await page.getByRole("button", { name: /EURUSD/ }).click().catch(() => {});
await page.waitForTimeout(4000);
await page.getByRole("button", { name: /XAUUSD/ }).click().catch(() => {});
await page.waitForTimeout(6000);

await page.getByRole("button", { name: "Analyse" }).click();
await page.getByText("Risk to reward").waitFor({ timeout: 90000 });
await page.waitForTimeout(10000);

await page.mouse.move(1150, 600);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(5000);
await page.mouse.wheel(0, 500);
await page.waitForTimeout(5000);

await page.getByRole("button", { name: /NAS100/ }).click().catch(() => {});
await page.waitForTimeout(6000);
await page.getByRole("button", { name: "Analyse" }).click();
await page.waitForTimeout(32000);

await page.mouse.wheel(0, 400);
await page.waitForTimeout(6000);

const video = page.video();
await context.close();
const recorded = await video.path();
fs.copyFileSync(recorded, dir + "\\demo.webm");
await browser.close();
console.log("VIDEO=saved");
