import { expect, test } from "@playwright/test";
import { acceptProjectNotice, seedStorage, PROJECT_NOTICE_STORAGE_KEY, THEME_STORAGE_KEY } from "./support/app.js";

// The accessible name of the theme control is state-dependent by design ("Włącz tryb ciemny" /
// "Włącz tryb jasny"), so the element is addressed through its authored hook and the name is
// asserted as part of the contract instead of being used as the locator.
const themeToggle = (page) => page.getByRole("banner").locator("[data-theme-toggle]");

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

  await toggle.click();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await expect(toggle).toHaveAccessibleName("Włącz tryb jasny");

  // Reloading proves the choice survived through the storage contract and the bootstrap,
  // without asserting on `localStorage` internals directly.
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(themeToggle(page)).toHaveAttribute("aria-pressed", "true");
});
