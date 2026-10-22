import { test, expect, type Page } from "@playwright/test";
import { gzipSync } from "node:zlib";
import messages from "../../shared/generated/web/ui.json" with { type: "json" };
import type { ListTransferV2 } from "../../src/list-transfer-types";
import { config, personalSnapshot, serveLyrics } from "../lyric-browser";
import { lyricFixture, lyricId } from "../lyric-fixture";
import { installScreenAwakeAdapter } from "../screen-awake";

const labels = messages.en, name = "Ordered synthetic list";
const start = (page: Page) => page.getByRole("button", { name: labels.reciteList, exact: true });
const exit = (page: Page) => page.getByRole("button", { name: labels.exitRecite, exact: true });
const previous = (page: Page) => page.getByRole("button", { name: labels.previousRecitationEntry, exact: true });
const next = (page: Page) => page.getByRole("button", { name: labels.nextRecitationEntry, exact: true });
const navigation = (page: Page) => page.getByRole("region", { name: labels.reciteList, exact: true });
const body = (page: Page) => page.getByRole("region", { name: labels.recite, exact: true });
const layout = (page: Page) => body(page).locator("div[lang=kn] > p").evaluateAll(elements =>
  elements.map(element => [element.id, element.textContent, element.hasAttribute("data-layout"), element.innerHTML]));
async function position(page: Page, value: number, total: number) {
  await expect(navigation(page).getByRole("heading")).toHaveText(labels.entryNumber
    .replace("{position}", String(value)).replace("{total}", String(total)));
}
async function prepare(page: Page, entries: ListTransferV2["entries"], history = false,
  fixture = lyricFixture(), corrupt: () => boolean = () => false) {
  const requests = await serveLyrics(page, fixture, corrupt);
  await page.goto("/#/settings");
  const enabled = page.getByRole("checkbox", { name: labels.recentHistoryEnabled, exact: true });
  await expect(enabled).toBeChecked();
  if (!history) { await enabled.click(); await expect(enabled).not.toBeChecked(); }
  const value: ListTransferV2 = { format: "daasavaani-list", formatVersion: 2, name, entries };
  await page.getByLabel(labels.transferFile, { exact: true }).setInputFiles({
    name: "synthetic-list-recite.gz", mimeType: "application/gzip", buffer: gzipSync(JSON.stringify(value)),
  });
  await expect(page.getByRole("heading", { name, exact: true })).toBeVisible();
  await page.getByRole("button", { name: labels.saveList, exact: true }).click();
  await page.getByRole("link", { name: labels.viewLists, exact: true }).click();
  await page.getByRole("list", { name: labels.lists, exact: true }).getByRole("button", { name, exact: true }).click();
  await expect(start(page)).toBeEnabled();
  return requests;
}
test("ordered mixed occurrences never deduplicate skip wrap or change personal data and retain cached text offline", async ({ page, context }) => {
  const raw = "  <b>Literal placeholder</b>  ";
  const requests = await prepare(page, [
    { kind: "lyric", lyricId: lyricId(1), fallback: "  Literal fallback  " },
    { kind: "lyric", lyricId: lyricId(1) },
    { kind: "placeholder", text: raw }, { kind: "placeholder", text: raw },
    { kind: "lyric", lyricId: lyricId(99), fallback: "Unresolved canonical" },
    { kind: "legacyVideo", videoId: lyricId(1), fallback: "Distinct legacy identity" },
    { kind: "legacyVideo", videoId: "fixture-one" }, { kind: "legacyVideo", videoId: "fixture-one" },
  ]);
  const before = await personalSnapshot(page);
  await start(page).click(); await position(page, 1, 8);
  await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(4);
  const original = await layout(page);
  expect(requests).toHaveLength(3); await expect(previous(page)).toBeDisabled();
  await expect(page.getByRole("navigation", { name: labels.appName, exact: true })).toBeHidden();
  await next(page).click(); await position(page, 2, 8); expect(await layout(page)).toEqual(original);
  for (const value of [3, 4]) {
    await next(page).click(); await position(page, value, 8);
    await expect(body(page).getByText(labels.lyricsUnavailable, { exact: true })).toBeVisible();
    expect(await body(page).locator("span").last().textContent()).toBe(raw);
    await expect(body(page).locator("b")).toHaveCount(0);
  }
  for (const value of [5, 6]) {
    await next(page).click(); await position(page, value, 8);
    await expect(body(page).getByText(labels.lyricsUnavailable, { exact: true })).toBeVisible();
    await expect(body(page).locator("div[lang=kn]")).toHaveCount(0);
  }
  await next(page).click(); await position(page, 7, 8);
  await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(2);
  const fixtureLayout = await layout(page);
  await next(page).click(); await position(page, 8, 8); expect(await layout(page)).toEqual(fixtureLayout);
  await expect(next(page)).toBeDisabled(); await expect(page.getByText(labels.recitationEnd, { exact: true })).toBeVisible();
  await context.setOffline(true);
  for (let value = 7; value >= 1; value--) { await previous(page).click(); await position(page, value, 8); }
  await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(4);
  expect(await layout(page)).toEqual(original); expect(requests).toHaveLength(3);
  await exit(page).press("Escape"); await expect(start(page)).toBeFocused();
  expect(await personalSnapshot(page)).toEqual(before);
  await context.setOffline(false);
});
test("an empty saved list has no invented position or reading request and both boundaries are disabled", async ({ page }) => {
  const requests = await prepare(page, []), before = await personalSnapshot(page);
  await start(page).click();
  await expect(navigation(page).getByRole("heading")).toHaveText(labels.emptyRecitation);
  await expect(previous(page)).toBeDisabled(); await expect(next(page)).toBeDisabled();
  await expect(body(page)).toHaveCount(0);
  await exit(page).click(); expect(requests).toHaveLength(0);
  expect(await personalSnapshot(page)).toEqual(before);
});
test("Back exits to exact draft controls while Forward Settings and restart never automatically enter list Recite", async ({ page }) => {
  await prepare(page, [{ kind: "placeholder", text: "Saved placeholder" }]);
  const rename = page.getByRole("form", { name: labels.renameList, exact: true }).getByLabel(labels.listName, { exact: true });
  await rename.fill("Unsaved list draft");
  await page.getByRole("button", { name: labels.editEntry, exact: true }).click();
  const draft = page.getByLabel(labels.placeholderText, { exact: true }); await draft.fill("Unsaved entry draft");
  const before = await personalSnapshot(page);
  await start(page).click(); await expect(exit(page)).toBeVisible();
  await page.goBack(); await expect(start(page)).toBeFocused();
  await expect(rename).toHaveValue("Unsaved list draft"); await expect(draft).toHaveValue("Unsaved entry draft");
  await page.goForward(); await expect(exit(page)).toHaveCount(0); await expect(start(page)).toBeVisible();
  await start(page).click(); await page.reload();
  await expect(exit(page)).toHaveCount(0);
  await page.getByRole("list", { name: labels.lists, exact: true }).getByRole("button", { name, exact: true }).click();
  await start(page).click(); await page.getByRole("button", { name: labels.showReadingControls, exact: true }).click();
  await page.getByRole("navigation", { name: labels.appName, exact: true }).getByRole("link", { name: labels.settings, exact: true }).click();
  await expect(page.locator("body")).not.toHaveAttribute("data-recite", /.+/);
  await page.goBack(); await expect(exit(page)).toHaveCount(0);
  await expect(page.getByRole("list", { name: labels.lists, exact: true })).toBeVisible();
  expect(await personalSnapshot(page)).toEqual(before);
});
test("reading preferences preserve literal text and one scoped wake request spans occurrences but not background or exit", async ({ page }) => {
  await installScreenAwakeAdapter(page);
  await prepare(page, [{ kind: "lyric", lyricId: lyricId(1) }, { kind: "lyric", lyricId: lyricId(1) }]);
  await start(page).click(); await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(4);
  const original = await layout(page), before = await personalSnapshot(page);
  const awake = page.getByRole("button", { name: labels.keepScreenAwake, exact: true });
  await awake.click(); await expect(awake).toHaveAttribute("aria-pressed", "true");
  await next(page).click(); await position(page, 2, 2);
  await expect(awake).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => [window.reciteWakeTest.requests, window.reciteWakeTest.releases])).toEqual([1, 0]);
  await page.getByRole("button", { name: labels.showReadingControls, exact: true }).click();
  await page.getByRole("button", { name: labels.increaseLyricFontSize, exact: true }).click();
  await expect(body(page).locator("div[lang=kn]")).toHaveCSS("font-size", `${config.readerFontSize + config.readerFontSizeStep}px`);
  await page.getByRole("combobox", { name: labels.readingDensity, exact: true }).selectOption("compact");
  await expect(body(page).locator("div[lang=kn]")).toHaveCSS("line-height",
    `${(config.readerFontSize + config.readerFontSizeStep) * config.readerLineHeights.compact}px`);
  expect(await layout(page)).toEqual(original);
  await page.evaluate(() => { window.reciteWakeTest.hidden = true; document.dispatchEvent(new Event("visibilitychange")); });
  await expect(awake).toHaveAttribute("aria-pressed", "false");
  await page.evaluate(() => { window.reciteWakeTest.hidden = false; document.dispatchEvent(new Event("visibilitychange")); });
  expect(await page.evaluate(() => window.reciteWakeTest.requests)).toBe(1);
  await exit(page).click();
  expect(await page.evaluate(() => [window.reciteWakeTest.requests, window.reciteWakeTest.releases])).toEqual([1, 1]);
  const after = await personalSnapshot(page);
  for (const key of ["lists", "recentHistory", "learningLabels"]) expect(after.tables[key]).toEqual(before.tables[key]);
});
test("catalog failures expose no partial text or writes and explicit retry reads only the selected lyric", async ({ page }) => {
  let corrupt = true;
  const requests = await prepare(page, [{ kind: "lyric", lyricId: lyricId(1) }], false, lyricFixture(), () => corrupt);
  const before = await personalSnapshot(page);
  await start(page).click(); await expect(body(page).getByRole("alert")).toBeVisible();
  await expect(body(page).locator("div[lang=kn]")).toHaveCount(0);
  expect(await personalSnapshot(page)).toEqual(before);
  corrupt = false; await body(page).getByRole("button", { name: labels.retry, exact: true }).click();
  await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(4);
  expect(requests).toHaveLength(4); expect(await personalSnapshot(page)).toEqual(before);
});
test("cancelled and late item responses never expose stale text or history while successful explicit occurrences use normal history", async ({ page }) => {
  const fixture = lyricFixture(), requests = await prepare(page, [
    { kind: "lyric", lyricId: lyricId(1), fallback: "Preserved fallback" },
    { kind: "placeholder", text: "Only this occurrence" },
    { kind: "legacyVideo", videoId: "fixture-one", fallback: "Independent legacy fallback" },
  ], true, fixture);
  const reference = fixture.manifest.catalog[0]!.item;
  let release!: () => void, held = 0;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route(new URL(reference.path, new URL(".", config.lyricPreview.descriptorUrl)).href, async route => {
    held++; await gate; await route.fulfill({ body: fixture.files.get(reference.path)!, contentType: "application/octet-stream",
      headers: { "access-control-allow-origin": "*" } });
  });
  const before = await personalSnapshot(page);
  await start(page).click(); await expect.poll(() => held).toBe(1);
  await body(page).getByRole("button", { name: labels.cancel, exact: true }).click();
  await expect(body(page).getByText(labels.loadingCancelled, { exact: true })).toBeVisible();
  await next(page).click(); await position(page, 2, 3); release();
  await expect(body(page).getByText("Only this occurrence", { exact: true })).toBeVisible();
  await expect(body(page).locator("div[lang=kn]")).toHaveCount(0);
  expect(await personalSnapshot(page)).toEqual(before);
  await previous(page).click(); await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(4);
  await expect.poll(async () => (await personalSnapshot(page)).tables.recentHistory)
    .toEqual([{ id: "history", enabled: true, entries: [{ kind: "lyric", lyricId: lyricId(1) }] }]);
  const recorded = await personalSnapshot(page);
  await next(page).click(); await previous(page).click();
  await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(4);
  expect(await personalSnapshot(page)).toEqual(recorded); expect(requests).toHaveLength(2);
  await next(page).click(); await next(page).click();
  await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(2);
  await expect.poll(async () => (await personalSnapshot(page)).tables.recentHistory)
    .toEqual([{ id: "history", enabled: true, entries: [
      { kind: "legacyVideo", videoId: "fixture-one" }, { kind: "lyric", lyricId: lyricId(1) },
    ] }]);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect((await personalSnapshot(page)).tables.lists).toEqual(before.tables.lists);
});
for (const mutation of ["rename", "delete"] as const) test(`an external list ${mutation} ends Recite explicitly instead of jumping or continuing stale occurrences`, async ({ page, context }) => {
  await prepare(page, [{ kind: "placeholder", text: "Independent occurrence" }]);
  const before = await personalSnapshot(page);
  await start(page).click(); await expect(exit(page)).toBeVisible();
  const peer = await context.newPage();
  try {
    await peer.goto("/#/lists");
    await peer.getByRole("list", { name: labels.lists, exact: true }).getByRole("button", { name, exact: true }).click();
    if (mutation === "rename") {
      await peer.getByRole("form", { name: labels.renameList, exact: true }).getByLabel(labels.listName, { exact: true }).fill("Changed externally");
      await peer.getByRole("button", { name: labels.renameList, exact: true }).click();
      await expect(peer.getByRole("list", { name: labels.lists, exact: true }).getByRole("button", { name: "Changed externally", exact: true })).toBeVisible();
    } else {
      await peer.getByRole("button", { name: labels.deleteList, exact: true }).click();
      await peer.getByRole("button", { name: labels.confirmDelete, exact: true }).click();
      await expect(peer.getByRole("list", { name: labels.lists, exact: true }).getByRole("button")).toHaveCount(0);
    }
    await expect(exit(page)).toHaveCount(0);
    await expect(page.getByRole("alert").filter({ hasText: labels.personalStale })).toBeVisible();
    await expect(page.getByRole("heading", { name: labels.lists, exact: true })).toBeFocused();
    expect((await personalSnapshot(page)).tables.control[0].revision).toBe(before.tables.control[0].revision + 1);
  } finally { await peer.close(); }
});
test("actual offline fixture reads reuse only already verified session content and unavailable downloads stay explicit and retryable", async ({ page, context }) => {
  await prepare(page, [
    { kind: "legacyVideo", videoId: "fixture-one" }, { kind: "legacyVideo", videoId: "fixture-one" },
    { kind: "legacyVideo", videoId: "fixture-two" },
  ]);
  const before = await personalSnapshot(page);
  await start(page).click(); await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(2);
  const original = await layout(page);
  await context.setOffline(true);
  await next(page).click(); await position(page, 2, 3); expect(await layout(page)).toEqual(original);
  await next(page).click(); await position(page, 3, 3);
  await expect(body(page).getByRole("alert")).toBeVisible();
  await expect(body(page).locator("div[lang=kn]")).toHaveCount(0);
  await previous(page).click(); await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(2);
  expect(await layout(page)).toEqual(original);
  await next(page).click(); await expect(body(page).getByRole("alert")).toBeVisible();
  await context.setOffline(false); await body(page).getByRole("button", { name: labels.retry, exact: true }).click();
  await expect(body(page).locator("div[lang=kn] > p")).toHaveCount(2);
  expect(await layout(page)).not.toEqual(original);
  await expect(page.getByRole("alert")).toHaveCount(0);
  expect(await personalSnapshot(page)).toEqual(before);
});
