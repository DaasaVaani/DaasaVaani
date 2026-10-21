import { test, expect } from "@playwright/test";
test("explicit index consent, actual search, reading and favorites persistence", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", request => requests.push(request.url()));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /^Library/, level: 1 })).toBeVisible();
  await expect(page.getByText("Development demo", { exact: false })).toBeVisible();
  expect(requests.filter(url => url.endsWith(".json.gz")).length).toBe(1);
  await page.getByRole("button", { name: "Load search", exact: false }).click();
  await page.getByRole("searchbox").fill("words");
  await expect(page.getByRole("article")).toHaveCount(1);
  await page.getByRole("article").getByRole("link", { name: "Read", exact: true }).click();
  await expect(page.getByText("ನೀರು ಮಣ್ಣು", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add to favorites" }).click();
  await expect(page.getByRole("button", { name: "Remove from favorites" })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("button", { name: "Remove from favorites" })).toBeVisible();
  await page.getByRole("link", { name: "Favorites", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(1);
});
test("UI language and theme do not change canonical text; no overflow at viewport width", async ({ page }) => {
  await page.goto("/#/settings");
  await page.getByRole("button", { name: "ಕನ್ನಡ", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "kn");
  await page.getByRole("button", { name: "ಗಾಢ", exact: true }).click();
  await page.getByRole("link", { name: "ಗ್ರಂಥಾಲಯ", exact: true }).last().click();
  await page.getByRole("article").first().getByRole("link", { name: "ಓದಿ", exact: true }).click();
  await expect(page.getByText("ರಾಮ ಕೃಷ್ಣ", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "kn");
});
test("corrupt manifest produces explicit error instead of a success-shaped empty library", async ({ page }) => {
  await page.route("**/demo/objects/*.json.gz", route => route.fulfill({ body: Buffer.from("corrupt") }));
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText("Artifact encoded size mismatch");
  await expect(page.getByRole("article")).toHaveCount(0);
});
test("invalid personal data is reported without overwriting the stored record", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /^Library/, level: 1 })).toBeVisible();
  const corrupt = { id: "personal", favorites: ["fixture-one", "fixture-one"], language: "en", theme: "light" };
  await page.evaluate(async value => {
    const [entry] = await indexedDB.databases();
    if (!entry?.name) throw new Error("The application database was not opened");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(entry.name!);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction("personal", "readwrite");
        transaction.objectStore("personal").put(value);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(transaction.error);
      });
    } finally { database.close(); }
  }, corrupt);
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("Invalid personal database record");
  const stored = await page.evaluate(async () => {
    const [entry] = await indexedDB.databases();
    if (!entry?.name) throw new Error("The application database was removed");
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(entry.name!);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      return await new Promise<unknown>((resolve, reject) => {
        const request = database.transaction("personal").objectStore("personal").get("personal");
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } finally { database.close(); }
  });
  expect(stored).toEqual(corrupt);
});
