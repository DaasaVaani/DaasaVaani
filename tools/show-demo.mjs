import { chromium } from "@playwright/test";
import { readFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { strictYaml } from "../shared/tools/generate-catalog.mjs";
const settings = strictYaml(await readFile(new URL("../settings/web.yml", import.meta.url), "utf8"));
const outputPosition = process.argv.indexOf("--out");
if (outputPosition < 0 || !process.argv[outputPosition + 1]) throw new Error("Pass --out with the screenshot output directory");
const output = resolve(process.argv[outputPosition + 1]);
await mkdir(output, { recursive: true });
const browsers = [];
for (const [name, viewport] of Object.entries(settings.demoViewports)) {
  const browser = await chromium.launch({ headless: false, args: [
    `--window-size=${viewport.width},${viewport.height + 100}`,
    `--window-position=${name === "desktop" ? 0 : viewport.width + 100},40`,
  ] });
  browsers.push(browser);
  const context = await browser.newContext({ viewport, isMobile: name === "mobile", hasTouch: name === "mobile" });
  const page = await context.newPage();
  const suffix = name === "mobile" ? "/#/item/fixture-one" : "/";
  await page.goto(`http://127.0.0.1:${settings.demoPort}${suffix}`);
  if (name === "mobile") await page.getByText("ರಾಮ ಕೃಷ್ಣ", { exact: true }).waitFor();
  else await page.getByRole("heading", { name: /^Library/, level: 1 }).waitFor();
  await page.screenshot({ path: resolve(output, `${name}-demo.png`), fullPage: true });
  console.log(`${name} browser ready at ${page.url()} (${viewport.width}x${viewport.height})`);
}
await Promise.all(browsers.map(browser => new Promise(resolve => browser.on("disconnected", resolve))));
