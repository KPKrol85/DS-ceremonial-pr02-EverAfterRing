import { expect, test } from "@playwright/test";
import { acceptProjectNotice, seedStorage, PROJECT_NOTICE_STORAGE_KEY, THEME_STORAGE_KEY } from "./support/app.js";

// The accessible name of the theme control is state-dependent by design ("Włącz tryb ciemny" /
// "Włącz tryb jasny"), so the element is addressed through its authored hook and the name is
// asserted as part of the contract instead of being used as the locator.
const themeToggle = (page) => page.getByRole("banner").locator("[data-theme-toggle]");
const themeColor = (page) => page.locator('meta[name="theme-color"]');

test("a stored dark preference is applied before first paint", async ({ page }) => {
  await seedStorage(page, {
    [PROJECT_NOTICE_STORAGE_KEY]: "true",
    [THEME_STORAGE_KEY]: "dark"
  });
  await page.goto("/");

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeToggle(page)).toHaveAttribute("aria-pressed", "true");
  await expect(themeToggle(page)).toHaveAccessibleName("Włącz tryb jasny");
});

test("the theme control switches the document theme and persists the choice", async ({ page }) => {
  await acceptProjectNotice(page);
  await page.goto("/");

  const toggle = themeToggle(page);

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await expect(toggle).toHaveAccessibleName("Włącz tryb ciemny");
  await expect(themeColor(page)).toHaveAttribute("content", "#faf7f2");

  await toggle.click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("Włącz tryb jasny");
  await expect(themeColor(page)).toHaveAttribute("content", "#171311");

  // Reloading proves the choice survived through the storage contract and the bootstrap,
  // without asserting on `localStorage` internals directly.
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeToggle(page)).toHaveAttribute("aria-pressed", "true");
});

test.describe("without a stored preference under a dark system scheme", () => {
  // Scoped here so the global light scheme in `playwright.config.js` still governs every other test.
  test.use({ colorScheme: "dark" });

  test("the system dark scheme survives theme initialization", async ({ page }) => {
    await acceptProjectNotice(page);
    await page.goto("/");

    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
    await expect(themeToggle(page)).toHaveAttribute("aria-pressed", "true");
    await expect(themeToggle(page)).toHaveAccessibleName("Włącz tryb jasny");
    await expect(themeColor(page)).toHaveAttribute("content", "#171311");
  });
});

test("a theme change in one tab reaches another open tab of the same context", async ({ context }) => {
  const first = await context.newPage();
  const second = await context.newPage();

  for (const page of [first, second]) {
    await acceptProjectNotice(page);
    await page.goto("/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  }

  await themeToggle(first).click();
  await expect(first.locator("html")).toHaveAttribute("data-theme", "dark");

  // The second page is neither reloaded nor sent a synthetic event: the browser delivers the
  // `storage` event for the write made by the first page.
  await expect(second.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeToggle(second)).toHaveAttribute("aria-pressed", "true");
  await expect(themeToggle(second)).toHaveAccessibleName("Włącz tryb jasny");
});
