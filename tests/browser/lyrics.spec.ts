import { test, expect, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import Ajv2020 from "ajv/dist/2020.js";
import { strictYaml } from "../../shared/tools/generate-catalog.mjs";
import webSchema from "../../settings/web.schema.json" with { type: "json" };
import messages from "../../shared/generated/web/ui.json" with { type: "json" };
import { lyricFixture, lyricId } from "../lyric-fixture";

const raw = strictYaml(readFileSync(new URL("../../settings/web.yml", import.meta.url), "utf8"));
const validate = new Ajv2020({ strict: true }).compile<Pick<WebConfig, "lyricPreview" | "databaseName">>(webSchema);
if (!validate(raw)) throw new Error("Invalid configured lyric browser settings");
const config = raw, base = new URL(".", config.lyricPreview.descriptorUrl), labels = messages.en;
async function serve(page: Page, fixture = lyricFixture(), corrupt: () => boolean = () => false) {
  const requests: string[] = [];
  const first = fixture.manifest.catalog[0];
  if (!first) throw new Error("Missing synthetic first item");
  await page.route(base.href + "**", route => {
    const url = new URL(route.request().url()), key = url.pathname.slice(base.pathname.length);
    const bytes = fixture.files.get(key);
    if (!bytes) throw new Error("Unexpected synthetic lyric artifact request");
    requests.push(key);
    return route.fulfill({ body: corrupt() && key === first.item.path ? Buffer.from("corrupt") : bytes,
      contentType: key === "latest.json" ? "application/json" : "application/octet-stream",
      headers: { "access-control-allow-origin": "*", "cache-control": "no-store" } });
  });
  return requests;
}
async function personalSnapshot(page: Page) {
  return page.evaluate(async databaseName => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(databaseName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const names = [...database.objectStoreNames], transaction = database.transaction(names, "readonly");
      return { version: database.version, tables: Object.fromEntries(await Promise.all(names.map(async name => [name,
        await new Promise<unknown[]>((resolve, reject) => {
          const request = transaction.objectStore(name).getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        })]))) };
    } finally { database.close(); }
  }, config.databaseName);
}
test("real lyric preparation needs consent, preserves personal data and exact layout, and resets on reload", async ({ page }) => {
  const requests = await serve(page);
  await page.goto("/#/lyrics");
  await expect(page.getByRole("button", { name: labels.prepareLibrary })).toBeVisible();
  expect(requests).toHaveLength(0);
  await expect(page.getByText("Development demo", { exact: false })).toHaveCount(0);
  await page.getByRole("link", { name: labels.settings, exact: true }).click();
  await expect(page.getByRole("button", { name: messages.en.languageName, exact: true })).toBeVisible();
  await page.getByRole("link", { name: labels.ownerLyrics, exact: true }).click();
  const before = await personalSnapshot(page);
  await page.getByRole("button", { name: labels.prepareLibrary }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
  expect(requests).toHaveLength(4);
  const preparedRequests = [...requests];
  await page.getByRole("article").first().getByRole("link", { name: labels.open, exact: true }).click();
  await expect(page.locator("div[lang=kn] > p")).toHaveText(["ಕನ್ನಡ 😀  ", " \t ", "", "ಅಕ್ಷರ"], { useInnerText: false });
  expect(await page.locator("div[lang=kn] > p").evaluateAll(nodes => nodes.map(node => node.textContent)))
    .toEqual(["ಕನ್ನಡ 😀  ", " \t ", "", "ಅಕ್ಷರ"]);
  await expect(page.getByRole("button", { name: labels.addFavorite })).toHaveCount(0);
  await expect(page.getByText(labels.canonical, { exact: true })).toHaveCount(0);
  await expect(page.getByText(labels.lyricNoMedia, { exact: true })).toBeVisible();
  expect(requests).toEqual(preparedRequests);
  expect(await personalSnapshot(page)).toEqual(before);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.getByRole("button", { name: labels.prepareLibrary })).toBeVisible();
  await expect(page.locator("div[lang=kn] > p")).toHaveCount(0);
  expect(requests).toEqual(preparedRequests);
});
test("complete title paging and reader Back/Forward retain exact query, focus and prepared bytes", async ({ page }) => {
  const count = config.lyricPreview.pageSize * 2 + 1, requests = await serve(page, lyricFixture(count));
  await page.goto("/#/lyrics");
  await page.getByRole("button", { name: labels.prepareLibrary }).click();
  await expect(page.getByRole("article")).toHaveCount(config.lyricPreview.pageSize);
  await page.getByRole("searchbox", { name: labels.lyricTitleFilter }).fill("synthetic");
  await page.getByRole("button", { name: labels.showMoreResults }).click();
  await expect(page.getByRole("article")).toHaveCount(config.lyricPreview.pageSize * 2);
  await page.getByRole("button", { name: labels.showMoreResults }).click();
  await expect(page.getByRole("article")).toHaveCount(count);
  const read = page.getByRole("article").last().getByRole("link", { name: labels.open, exact: true });
  await expect(read).toBeFocused();
  const position = await page.evaluate(() => window.scrollY);
  const before = [...requests];
  await read.press("Enter");
  await expect(page).toHaveURL(new RegExp(lyricId(count)));
  await page.goBack();
  await expect(page.getByRole("searchbox")).toHaveValue("synthetic");
  await expect(read).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeCloseTo(position, 0);
  await expect(page.getByRole("article")).toHaveCount(count);
  await page.goForward();
  await expect(page.locator("div[lang=kn] > p")).toHaveCount(4);
  await page.getByRole("link", { name: labels.lyricBack, exact: false }).click();
  await expect(read).toBeFocused();
  expect(requests).toEqual(before);
});
test("corrupt owner artifacts fail without partial browsing and retry independently of unavailable fixtures", async ({ page }) => {
  let corrupt = true;
  await serve(page, lyricFixture(), () => corrupt);
  await page.route("**/demo/latest.json", route => route.fulfill({ status: 503, body: "Unavailable" }));
  await page.goto("/#/lyrics");
  await page.getByRole("button", { name: labels.prepareLibrary }).click();
  await expect(page.getByRole("alert")).toContainText("Artifact encoded size mismatch");
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByText(labels.noResults, { exact: true })).toHaveCount(0);
  corrupt = false;
  await page.getByRole("button", { name: labels.retry }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
  await expect(page.getByRole("alert")).toHaveCount(0);
  await page.getByRole("article").first().getByRole("link", { name: labels.open, exact: true }).click();
  await expect(page.locator("div[lang=kn] > p")).toHaveCount(4);
});
test("cancellation aborts the active download and retry cannot activate stale partial state", async ({ page }) => {
  const requests = await serve(page);
  await page.addInitScript(descriptorUrl => {
    const original = window.fetch.bind(window);
    Reflect.set(window, "holdLyricDownload", true);
    Reflect.set(window, "lyricDownloadAborted", false);
    window.fetch = (input, options) => {
      const url = input instanceof Request ? input.url : String(input);
      if (url === descriptorUrl && Reflect.get(window, "holdLyricDownload")) {
        return new Promise<Response>((_resolve, reject) => {
          const signal = options?.signal;
          if (!signal) throw new Error("Missing lyric download abort signal");
          signal.addEventListener("abort", () => {
            Reflect.set(window, "lyricDownloadAborted", true);
            reject(signal.reason);
          }, { once: true });
        });
      }
      return original(input, options);
    };
  }, config.lyricPreview.descriptorUrl);
  await page.goto("/#/lyrics");
  await page.getByRole("button", { name: labels.prepareLibrary }).click();
  await page.getByRole("button", { name: labels.cancel, exact: true }).click();
  await expect.poll(() => page.evaluate(() => Reflect.get(window, "lyricDownloadAborted"))).toBe(true);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(requests).toHaveLength(0);
  await page.evaluate(() => Reflect.set(window, "holdLyricDownload", false));
  await page.getByRole("button", { name: labels.prepareLibrary }).click();
  await expect(page.getByRole("article")).toHaveCount(2);
  expect(requests).toHaveLength(4);
});
test("unknown lyric IDs never infer matches and saved UI locale/theme do not alter canonical Kannada", async ({ page }) => {
  await serve(page);
  await page.goto("/#/lyrics/00000000-0000-4000-8000-000000000000");
  await page.getByRole("button", { name: labels.prepareLibrary }).click();
  await expect(page.getByRole("alert")).toHaveText(labels.lyricsUnavailable);
  await expect(page.locator("div[lang=kn] > p")).toHaveCount(0);
  await page.getByRole("link", { name: labels.settings, exact: true }).click();
  await page.getByRole("button", { name: messages.kn.languageName, exact: true }).click();
  await page.getByRole("button", { name: messages.kn.warm, exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
  await page.getByRole("link", { name: messages.kn.ownerLyrics, exact: true }).click();
  await page.getByRole("article").first().getByRole("link", { name: messages.kn.open, exact: true }).click();
  await expect(page.locator("div[lang=kn] > p").first()).toHaveText("ಕನ್ನಡ 😀  ");
  await page.reload();
  await page.getByRole("button", { name: messages.kn.prepareLibrary }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "kn");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "warm");
  await expect(page.locator("div[lang=kn] > p").first()).toHaveText("ಕನ್ನಡ 😀  ");
});
