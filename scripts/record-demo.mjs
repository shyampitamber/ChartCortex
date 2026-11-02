import fs from "node:fs";
import { chromium } from "playwright-core";

const exe =
  "C:\\Users\\admin\\AppData\\Local\\ms-playwright\\chromium-1243\\chrome-win64\\chrome.exe";
const dir = "E:\\MyApps\\ChartCortex\\.design\\video";
fs.mkdirSync(dir, { recursive: true });
for (const file of fs.readdirSync(dir)) {
  if (file.endsWith(".webm")) fs.rmSync(dir + "\\" + file);
}

const browser = await chromium.launch({ executablePath: exe, headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  recordVideo: { dir, size: { width: 1440, height: 900 } },
  colorScheme: "light",
});

const page = await context.newPage();
await page.goto("https://ChartCortex.vercel.app/scan", { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);
await page.setInputFiles(
  "input[type=file]",
  "E:\\MyApps\\ChartCortex\\public\\sample-chart.png"
);
await page.waitForSelector('img[alt="Uploaded chart"]', { timeout: 20000 });
await page.waitForTimeout(1600);
await page.getByRole("button", { name: "Scan chart" }).click();
await page.waitForSelector("text=Risk to reward", { timeout: 70000 });
await page.waitForTimeout(2600);
await page.mouse.move(1150, 600);
await page.mouse.wheel(0, 380);
await page.waitForTimeout(1800);
await page.mouse.wheel(0, 480);
await page.waitForTimeout(1800);

const video = page.video();
await context.close();
const recorded = await video.path();
fs.copyFileSync(recorded, "E:\\MyApps\\ChartCortex\\.design\\video\\demo.webm");
await browser.close();
console.log("VIDEO=saved");
