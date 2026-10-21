import { test, expect, type Page } from "@playwright/test";
import { gzipSync } from "node:zlib";
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
  const ids = JSON.stringify(saved.values.lists).match(/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g) ?? [];
  expect(ids).toHaveLength(4); expect(new Set(ids).size).toBe(4);
  await page.getByRole("link", { name: "View saved lists", exact: true }).click();
  await page.getByRole("list", { name: "Lists", exact: true }).getByRole("button", { name: snapshot.name, exact: true }).click();
  await expect(page.locator("main ol > li")).toHaveCount(3);
  await expect(page.locator("main ol > li").nth(1)).toHaveText("Intentional placeholder: <b>Plain text</b>");
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
