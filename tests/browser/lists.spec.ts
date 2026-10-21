import { test, expect, type Page } from "@playwright/test";
import { gzipSync, gunzipSync, deflateRawSync } from "node:zlib";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { strictYaml } from "../../shared/tools/generate-catalog.mjs";
import type { ListSnapshot } from "../../src/list-transfer-types";

const web = strictYaml(readFileSync(new URL("../../settings/web.yml", import.meta.url), "utf8"));
const limits = strictYaml(readFileSync(new URL("../../shared/settings/personal-transfer.yml", import.meta.url), "utf8"));
if (!web || typeof web !== "object" || !("databaseName" in web) || typeof web.databaseName !== "string" ||
    !limits || typeof limits !== "object" || !("maxLists" in limits) || typeof limits.maxLists !== "number" ||
    !("maxListNameCodePoints" in limits) || typeof limits.maxListNameCodePoints !== "number" ||
    !("maxEntryTextCodePoints" in limits) || typeof limits.maxEntryTextCodePoints !== "number") {
  throw new Error("Invalid list browser test configuration");
}
const databaseName = web.databaseName, maxLists = limits.maxLists;
const maxName = limits.maxListNameCodePoints, maxText = limits.maxEntryTextCodePoints;
const snapshot: ListSnapshot = { format: "daasavaani-list", formatVersion: 1, name: "Straße", entries: [
  { kind: "item", videoId: "fixture_ref", fallback: "  User note  " },
  { kind: "placeholder", text: "<b>Plain text</b>" }, { kind: "item", videoId: "fixture_ref" },
] };
async function records(page: Page) {
  return page.evaluate(async name => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      const values: Record<string, unknown[]> = {};
      for (const store of database.objectStoreNames) values[store] = await new Promise<unknown[]>((resolve, reject) => {
        const request = database.transaction(store).objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
      });
      return { version: database.version, values };
    } finally { database.close(); }
  }, databaseName);
}
const listIdentities = (value: unknown) => JSON.stringify(value).match(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g) ?? [];
async function upload(page: Page, value = snapshot) {
  await page.goto("/#/settings");
  await page.getByLabel("Choose a list file").setInputFiles({ name: "synthetic.gz", mimeType: "application/gzip", buffer: gzipSync(JSON.stringify(value)) });
  await expect(page.getByRole("heading", { name: value.name, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save to My Library", exact: true })).toBeEnabled();
}
async function create(page: Page, name: string) {
  const form = page.getByRole("form", { name: "Create empty list", exact: true });
  await form.getByLabel("List name", { exact: true }).fill(name);
  await form.getByRole("button", { name: "Create empty list", exact: true }).click();
}
async function seedLegacy(page: Page, value: unknown, version = 10) {
  await page.route("**/personal-fixture-seed", route => route.fulfill({
    contentType: "text/html", body: "<!doctype html><title>Synthetic personal fixture</title>",
  }));
  await page.goto("/personal-fixture-seed");
  await page.evaluate(async input => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(input.name, input.version);
      request.onupgradeneeded = () => {
        request.result.createObjectStore("personal", { keyPath: "id" });
        if (input.version > 20) request.result.createObjectStore("future", { keyPath: "id" });
      };
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const stores = [...database.objectStoreNames];
        const transaction = database.transaction(stores, "readwrite");
        transaction.objectStore("personal").put(input.value);
        if (stores.includes("future")) transaction.objectStore("future").put({ id: "synthetic-future", text: "Preserve me" });
        transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally { database.close(); }
  }, { name: databaseName, value, version });
  await page.unroute("**/personal-fixture-seed");
}
test("confirmed import persists plain text and repeated independent occurrences without the Library endpoint", async ({ page }) => {
  await page.route("**/demo/latest.json", route => route.abort());
  await upload(page);
  const before = await records(page);
  await expect(page.locator("main b")).toHaveCount(0);
  expect(await records(page)).toEqual(before);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await expect(page.getByText("Saved as an independent local list.", { exact: true })).toBeVisible();
  const saved = await records(page);
  expect(saved.values.lists).toHaveLength(1);
  const ids = listIdentities(saved.values.lists);
  expect(ids).toHaveLength(4); expect(new Set(ids).size).toBe(4);
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  await page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: snapshot.name, exact: true }).click();
  await expect(page.locator("main ol > li")).toHaveCount(3);
  await expect(page.locator("main ol > li").nth(1).locator(":scope > span").nth(1)).toHaveText("<b>Plain text</b>");
  await expect(page.getByText("Lyrics unavailable in DaasaVaani.", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: snapshot.name, exact: true })).toBeVisible();
  expect(await records(page)).toEqual(saved);
});
test("duplicate-name cancellation is no-write and a changed revision requires renewed confirmation across tabs", async ({ page, context }) => {
  await upload(page);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await expect(page.getByText("Saved as an independent local list.", { exact: true })).toBeVisible();
  await page.getByLabel("List name", { exact: true }).fill("STRASSE");
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save with same name", exact: true })).toBeVisible();
  const before = await records(page);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await records(page)).toEqual(before);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save with same name", exact: true })).toBeVisible();
  const other = await context.newPage(); await other.goto("/#/lists");
  await create(other, "Other");
  await expect(other.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: "Other", exact: true })).toBeVisible();
  const changed = await records(page);
  await page.getByRole("button", { name: "Save with same name", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Personal data changed.");
  expect(await records(page)).toEqual(changed);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("button", { name: "Save with same name", exact: true }).click();
  await expect.poll(async () => (await records(page)).values.lists?.length).toBe(3);
  await other.reload();
  await expect(other.getByRole("list", { name: "Lists", exact: true }).getByRole("button")).toHaveCount(3);
  const saved = await records(page);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save with same name", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Create snapshot link", exact: true }).click();
  await expect(page.locator("input[readonly]")).toBeVisible();
  await expect(page.getByRole("button", { name: "Save with same name", exact: true })).toHaveCount(0);
  expect(await records(page)).toEqual(saved);
});
test("occurrence editing, movement, manual replacement and removal retain IDs, text, repetitions and persisted order", async ({ page }) => {
  await upload(page);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  const choose = () => page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: snapshot.name, exact: true }).click();
  await choose();
  const before = await records(page), ids = listIdentities(before.values.lists);
  const editor = page.getByRole("form", { name: "Edit entry", exact: true });
  await page.getByRole("button", { name: "Add placeholder", exact: true }).click();
  await editor.getByLabel("Placeholder text", { exact: true }).fill("<b>Plain text</b>");
  await editor.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.locator("main ol > li")).toHaveCount(4);
  const added = listIdentities((await records(page)).values.lists);
  expect(added.slice(0, 4)).toEqual(ids); expect(new Set(added).size).toBe(5);
  await page.getByRole("group", { name: "Entry 4 of 4", exact: true }).getByRole("button", { name: "Move up", exact: true }).click();
  await expect.poll(async () => listIdentities((await records(page)).values.lists)).toEqual([ids[0], ids[1], ids[2], added[4], ids[3]]);
  await expect(page.getByRole("group", { name: "Entry 3 of 4", exact: true })).toBeFocused();
  await page.getByRole("group", { name: "Entry 2 of 4", exact: true }).getByRole("button", { name: "Replace with library reference", exact: true }).click();
  await expect(editor.getByLabel("User fallback label (optional; leave empty to remove)", { exact: true })).toHaveValue("<b>Plain text</b>");
  await editor.getByLabel("Library video identifier", { exact: true }).fill("replacement_ref");
  await editor.getByLabel("User fallback label (optional; leave empty to remove)", { exact: true }).fill("  Replacement label  ");
  await editor.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.locator("main ol > li").nth(1).locator("code")).toHaveText("replacement_ref");
  expect(listIdentities((await records(page)).values.lists)).toEqual([ids[0], ids[1], ids[2], added[4], ids[3]]);
  await page.getByRole("group", { name: "Entry 1 of 4", exact: true }).getByRole("button", { name: "Remove this occurrence", exact: true }).click();
  await expect(page.locator("main ol > li")).toHaveCount(3);
  const saved = await records(page);
  expect(listIdentities(saved.values.lists)).toEqual([ids[0], ids[2], added[4], ids[3]]);
  expect(saved.values.lists).toMatchObject([{ entries: [
    { kind: "item", videoId: "replacement_ref", fallback: "  Replacement label  " },
    { kind: "placeholder", text: "<b>Plain text</b>" }, { kind: "item", videoId: "fixture_ref" },
  ] }]);
  expect(saved.values.personal).toEqual(before.values.personal);
  await expect(page.locator("main b")).toHaveCount(0);
  await page.reload(); await choose();
  expect(await records(page)).toEqual(saved);
});
test("entry input bounds, cancellation and cross-tab stale edits never partially mutate personal data", async ({ page, context }) => {
  await page.goto("/#/lists"); await create(page, "Editing");
  const choose = () => page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: "Editing", exact: true }).click();
  await choose(); const before = await records(page);
  const editor = page.getByRole("form", { name: "Edit entry", exact: true });
  await page.getByRole("button", { name: "Add placeholder", exact: true }).click();
  await editor.getByLabel("Placeholder text", { exact: true }).fill("😀".repeat(maxText + 1));
  await editor.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("List name or entry is invalid");
  expect(await records(page)).toEqual(before);
  await editor.getByLabel("Placeholder text", { exact: true }).fill("😀".repeat(maxText));
  await editor.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.locator("main ol > li")).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("button", { name: "Edit entry", exact: true }).click();
  await editor.getByLabel("Placeholder text", { exact: true }).fill("Cancelled");
  const saved = await records(page);
  await editor.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await records(page)).toEqual(saved);
  await page.getByRole("button", { name: "Edit entry", exact: true }).click();
  await editor.getByLabel("Placeholder text", { exact: true }).fill("Draft");
  const other = await context.newPage(); await other.goto("/#/lists"); await create(other, "Other");
  await expect(other.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: "Other", exact: true })).toBeVisible();
  const changed = await records(page);
  await editor.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("Personal data changed.");
  expect(await records(page)).toEqual(changed);
});
test("entry changes do not repeat duplicate-name warnings but an actual rename still requires confirmation", async ({ page }) => {
  await page.goto("/#/lists"); await create(page, "Same"); await create(page, "SAME");
  await page.getByRole("button", { name: "Save with same name", exact: true }).click();
  await page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: "Same", exact: true }).click();
  await page.getByRole("button", { name: "Add library reference", exact: true }).click();
  const editor = page.getByRole("form", { name: "Edit entry", exact: true });
  await editor.getByLabel("Library video identifier", { exact: true }).fill("fixture_ref");
  await editor.getByRole("button", { name: "Save entry", exact: true }).click();
  await expect(page.locator("main ol > li")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Save with same name", exact: true })).toHaveCount(0);
  const before = await records(page);
  const rename = page.getByRole("form", { name: "Rename list", exact: true });
  await rename.getByLabel("List name", { exact: true }).fill("same");
  await rename.getByRole("button", { name: "Rename list", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save with same name", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await records(page)).toEqual(before);
});
test("saved-list exports use the stored name and exact minimal snapshot without writes or library downloads", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.route("**/demo/latest.json", route => route.abort());
  await upload(page);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  const choose = () => page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: snapshot.name, exact: true }).click();
  await choose(); await page.reload(); await choose();
  await page.getByRole("form", { name: "Rename list", exact: true }).getByLabel("List name", { exact: true }).fill("Unsaved draft name");
  const before = await records(page);
  await page.getByRole("button", { name: "Download list file", exact: true }).click();
  const [download] = await Promise.all([page.waitForEvent("download"),
    page.getByRole("link", { name: "Download list file", exact: true }).click()]);
  const path = await download.path(); if (!path) throw new Error("Saved-list download did not complete");
  expect(JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"))).toEqual(snapshot);
  await page.getByRole("button", { name: "Create snapshot link", exact: true }).click();
  const output = page.locator("input[readonly]"); await expect(output).toBeVisible();
  const url = new URL(await output.inputValue()); expect(url.protocol).toBe("https:");
  expect(await records(page)).toEqual(before);
  await page.goto(url.pathname + url.hash);
  await expect(page.getByRole("heading", { name: snapshot.name, exact: true })).toBeVisible();
  expect(await records(page)).toEqual(before);
  expect(requests.filter(url => url.endsWith(".json.gz"))).toHaveLength(0);
});
test("same-document open-path export navigation decodes the current route, not an old lists hash", async ({ page }) => {
  const original = { ...snapshot, name: "Synthetic route regression" };
  await page.goto("/open/#/list/" + deflateRawSync(JSON.stringify(original)).toString("base64url"));
  await expect(page.getByRole("heading", { name: original.name, exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  await page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: original.name, exact: true }).click();
  await page.getByRole("group", { name: "Entry 2 of 3", exact: true }).getByRole("button", { name: "Move up", exact: true }).click();
  await expect(page.getByRole("group", { name: "Entry 1 of 3", exact: true })).toBeFocused();
  const before = await records(page);
  await page.getByRole("button", { name: "Create snapshot link", exact: true }).click();
  const output = page.locator("input[readonly]"); await expect(output).toBeVisible();
  const url = new URL(await output.inputValue());
  await page.goto(url.pathname + url.hash);
  await expect(page.getByRole("heading", { name: original.name, exact: true })).toBeVisible();
  await expect(page.locator("main ol > li").first()).toContainText("<b>Plain text</b>");
  expect(await records(page)).toEqual(before);
  await page.goto(url.pathname + url.hash + "?unexpected=1");
  await expect(page.getByRole("alert")).toContainText("Invalid or unsupported");
  expect(await records(page)).toEqual(before);
});
test("an export changed during encoding is refused until a fresh list selection", async ({ page, context }) => {
  await upload(page); await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  const choose = () => page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: snapshot.name, exact: true }).click();
  await choose();
  await page.route("**/*list-transfer.worker*.js", route => route.fulfill({ contentType: "text/javascript", body: "self.onmessage = () => {};" }));
  const created = page.waitForEvent("worker");
  await page.getByRole("button", { name: "Download list file", exact: true }).click();
  const worker = await created;
  const other = await context.newPage(); await other.goto("/#/lists"); await create(other, "Concurrent change");
  await expect(other.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: "Concurrent change", exact: true })).toBeVisible();
  const changed = await records(page);
  await worker.evaluate(bytes => { setTimeout(() => self.postMessage({ result: { kind: "file", bytes: new Uint8Array(bytes) } }), 100); },
    [...gzipSync(JSON.stringify(snapshot))]);
  await expect(page.getByRole("alert")).toContainText("Personal data changed.");
  await expect(page.getByRole("link", { name: "Download list file", exact: true })).toHaveCount(0);
  expect(await records(page)).toEqual(changed);
  await page.unroute("**/*list-transfer.worker*.js"); await choose();
  await page.getByRole("button", { name: "Create snapshot link", exact: true }).click();
  await expect(page.locator("input[readonly]")).toBeVisible();
  expect(await records(page)).toEqual(changed);
});
test("cancelling saved-list encoding terminates its worker and leaves all tables unchanged", async ({ page }) => {
  await upload(page); await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  await page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: snapshot.name, exact: true }).click();
  const before = await records(page);
  await page.route("**/*list-transfer.worker*.js", route => route.fulfill({ contentType: "text/javascript", body: "self.onmessage = () => {};" }));
  const created = page.waitForEvent("worker");
  await page.getByRole("button", { name: "Download list file", exact: true }).click();
  const worker = await created, closed = worker.waitForEvent("close");
  await page.getByRole("button", { name: "Cancel", exact: true }).click(); await closed;
  await expect(page.getByRole("link", { name: "Download list file", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Download list file", exact: true })).toBeEnabled();
  expect(await records(page)).toEqual(before);
});
test("oversized saved links retain a lossless file fallback without database writes", async ({ page }) => {
  const large: ListSnapshot = { ...snapshot, name: "Large synthetic export", entries: Array.from({ length: 64 }, (_, index) => ({
    kind: "placeholder", text: Array.from({ length: 8 }, (_, part) => createHash("sha256").update(`${index}:${part}`).digest("hex")).join(""),
  })) };
  await upload(page, large); await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  await page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: large.name, exact: true }).click();
  const before = await records(page);
  await page.getByRole("button", { name: "Create snapshot link", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("The complete link exceeds");
  await expect(page.locator("input[readonly]")).toHaveCount(0);
  await page.getByRole("button", { name: "Download list file", exact: true }).click();
  const [download] = await Promise.all([page.waitForEvent("download"),
    page.getByRole("link", { name: "Download list file", exact: true }).click()]);
  const path = await download.path(); if (!path) throw new Error("Lossless fallback download did not complete");
  expect(JSON.parse(gunzipSync(readFileSync(path)).toString("utf8"))).toEqual(large);
  expect(await records(page)).toEqual(before);
});
test("rename, independent duplication and confirmed deletion preserve unrelated lists", async ({ page }) => {
  await upload(page);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  const menu = page.getByRole("list", { name: "Lists", exact: true });
  await menu.getByRole("button", { name: snapshot.name, exact: true }).click();
  const rename = page.getByRole("form", { name: "Rename list", exact: true });
  await rename.getByLabel("List name", { exact: true }).fill("Renamed");
  await rename.getByRole("button", { name: "Rename list", exact: true }).click();
  await menu.getByRole("button", { name: "Renamed", exact: true }).click();
  await rename.getByLabel("List name", { exact: true }).fill("Copy");
  await page.getByRole("button", { name: "Duplicate list", exact: true }).click();
  await menu.getByRole("button", { name: "Copy", exact: true }).click();
  const before = await records(page);
  const ids = JSON.stringify(before.values.lists).match(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g) ?? [];
  expect(ids).toHaveLength(8); expect(new Set(ids).size).toBe(8);
  await page.getByRole("button", { name: "Delete list", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await records(page)).toEqual(before);
  await page.getByRole("button", { name: "Delete list", exact: true }).click();
  await page.getByRole("button", { name: "Confirm list deletion", exact: true }).click();
  await expect(menu.getByRole("button", { name: "Copy", exact: true })).toHaveCount(0);
  await expect(menu.getByRole("button", { name: "Renamed", exact: true })).toBeVisible();
  expect((await records(page)).values.lists).toHaveLength(1);
});
test("maximum-length user names and text wrap; invalid name input is actionable and never mutates data", async ({ page }) => {
  const value: ListSnapshot = { ...snapshot, name: "N".repeat(maxName), entries: [{ kind: "placeholder", text: "P".repeat(maxText) }] };
  await upload(page, value);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  await page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: value.name, exact: true }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const before = await records(page);
  const rename = page.getByRole("form", { name: "Rename list", exact: true });
  await rename.getByLabel("List name", { exact: true }).fill(value.name + "X");
  await rename.getByRole("button", { name: "Rename list", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("List name or entry is invalid");
  expect(await records(page)).toEqual(before);
});
test("v1 migration preserves favorites and preferences", async ({ page }) => {
  const value = { id: "personal", favorites: ["fixture_ref"], language: "kn", theme: "dark" };
  await seedLegacy(page, value);
  await page.goto("/#/lists");
  await expect(page.locator("html")).toHaveAttribute("lang", "kn");
  await expect(page.getByRole("heading", { name: "ಪಟ್ಟಿಗಳು", exact: true })).toBeVisible();
  const after = await records(page);
  expect(after.version).toBe(20); expect(after.values.personal).toEqual([value]);
  expect(after.values.lists).toEqual([]); expect(after.values.control).toHaveLength(1);
});
test("invalid legacy migration rolls back the schema and refuses personal writes", async ({ page }) => {
  const value = { id: "personal", favorites: ["duplicate", "duplicate"], language: "en", theme: "light" };
  await seedLegacy(page, value);
  const before = await records(page);
  await page.goto("/#/settings");
  await expect(page.getByRole("alert")).toContainText("Invalid personal database record");
  expect(await records(page)).toEqual(before);
  await page.getByLabel("Choose a list file").setInputFiles({ name: "synthetic.gz", mimeType: "application/gzip", buffer: gzipSync(JSON.stringify(snapshot)) });
  await expect(page.getByRole("heading", { name: snapshot.name, exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save to My Library", exact: true })).toBeDisabled();
  expect(await records(page)).toEqual(before);
});
test("newer personal schemas are refused without deleting unfamiliar stores", async ({ page }) => {
  await seedLegacy(page, { id: "personal", favorites: [], language: "en", theme: "light" }, 30);
  const before = await records(page);
  await page.goto("/#/settings");
  await expect(page.getByRole("alert")).toContainText("newer personal database schema");
  expect(await records(page)).toEqual(before);
});
test("an already-open old client cannot commit a pending confirmation into a future schema", async ({ page }) => {
  await upload(page);
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await expect(page.getByText("Saved as an independent local list.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save to My Library", exact: true }).click();
  await expect(page.getByRole("button", { name: "Save with same name", exact: true })).toBeVisible();
  await page.evaluate(async name => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(name, 30);
      request.onupgradeneeded = () => request.result.createObjectStore("future", { keyPath: "id" }).put({ id: "synthetic-future" });
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    database.close();
  }, databaseName);
  const before = await records(page);
  await page.getByRole("button", { name: "Save with same name", exact: true }).click();
  await expect(page.getByText("Personal storage failed. Try again; do not delete your data.", { exact: true })).toBeVisible();
  expect(await records(page)).toEqual(before);
});
test("a blocked non-destructive migration reports recovery and can retry after the old connection closes", async ({ page, context }) => {
  const value = { id: "personal", favorites: ["fixture_ref"], language: "en", theme: "dark" };
  await seedLegacy(page, value);
  const held = await page.evaluateHandle(async name => new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name);
    request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
  }), databaseName);
  try {
    const app = await context.newPage(); await app.goto("/");
    await expect(app.getByRole("alert")).toContainText("Personal database upgrade is blocked");
    await held.evaluate(database => database.close());
    await app.getByRole("button", { name: "Try again", exact: true }).click();
    await expect(app.getByRole("heading", { name: /^Library/, level: 1 })).toBeVisible();
    expect((await records(app)).values.personal).toEqual([value]);
  } finally { await held.evaluate(database => database.close()); await held.dispose(); }
});
test("the actual configured list-count ceiling accepts the last list then rejects limit plus one without mutation", async ({ page }) => {
  await page.goto("/#/lists");
  await expect(page.getByRole("heading", { name: "Lists", exact: true })).toBeVisible();
  await page.evaluate(async input => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(input.name);
      request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction("lists", "readwrite");
        for (let position = 1; position < input.limit; position++) transaction.objectStore("lists").put({
          id: `00000000-0000-4000-8000-${position.toString(16).padStart(12, "0")}`, name: `Synthetic ${position}`, entries: [],
        });
        transaction.oncomplete = () => resolve(); transaction.onerror = () => reject(transaction.error);
      });
    } finally { database.close(); }
  }, { name: databaseName, limit: maxLists });
  await page.reload();
  await expect(page.getByRole("heading", { name: "Lists", exact: true })).toBeVisible();
  await create(page, "Last permitted list");
  await expect(page.getByText("Saved as an independent local list.", { exact: true })).toBeVisible();
  const before = await records(page); expect(before.values.lists).toHaveLength(maxLists);
  await create(page, "One list too many");
  await expect(page.getByRole("alert")).toContainText("storage limit would be exceeded");
  expect(await records(page)).toEqual(before);
});
