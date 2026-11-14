import { expect, test } from "@playwright/test";

// `js/modules/nav.js` treats viewports of 1024px and below as mobile navigation. The light
// color scheme pinned in `playwright.config.js` still applies, so the fallback theme is `light`.
test.use({ viewport: { width: 390, height: 844 } });

test("the site stays operable when accessing localStorage throws a SecurityError", async ({ page }) => {
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  // Blocks storage at the `window.localStorage` property itself, as browsers do when site data
  // is disallowed, so every read and write fails before `getItem()`/`setItem()` are reached.
  // Init scripts run before any page script, including the inlined theme bootstrap. The counter
  // only observes property access, so the test can confirm each write path hit the failure.
  // The existing storage-seeding helpers are deliberately not used: their writes would throw here.
  await page.addInitScript(() => {
    window.__blockedStorageAccesses = 0;
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        window.__blockedStorageAccesses += 1;
        throw new DOMException("Access to localStorage is denied.", "SecurityError");
      }
    });
  });

  await page.goto("/");

  const blockedAccesses = () => page.evaluate(() => window.__blockedStorageAccesses);
  const html = page.locator("html");
  const body = page.locator("body");
  const themeToggle = page.getByRole("banner").locator("[data-theme-toggle]");
  const themeColor = page.locator('meta[name="theme-color"]');
  const dialog = page.getByRole("dialog", { name: "Informacja o projekcie" });

  // `initTheme()` sets this marker after reading storage, so the storage reads have already failed.
  await expect(themeToggle).toHaveAttribute("data-initialized", "true");

  // The simulation is checked in the page itself; this exception is caught here on purpose and
  // is not one of the uncaught `pageerror` events asserted at the end.
  const probe = await page.evaluate(() => {
    try {
      void window.localStorage;
      return null;
    } catch (error) {
      return { isDOMException: error instanceof DOMException, name: error.name };
    }
  });
  expect(probe).toEqual({ isDOMException: true, name: "SecurityError" });

  // Theme fallback: no readable preference and a light system scheme resolve to `light`.
  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(themeToggle).toHaveAttribute("aria-pressed", "false");
  await expect(themeToggle).toHaveAccessibleName("Włącz tryb ciemny");
  await expect(themeColor).toHaveAttribute("content", "#faf7f2");

  // Project notice: an unreadable store means no acceptance, so the notice opens on load.
  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();
  await expect(body).toHaveClass(/\bis-project-notice-open\b/);

  const beforeAccept = await blockedAccesses();
  await dialog.getByRole("button", { name: "Akceptuję" }).click();

  await expect(dialog).toBeHidden();
  await expect(body).not.toHaveClass(/\bis-project-notice-open\b/);
  await expect(body).toBeFocused();
  // The acceptance write was attempted and failed, yet the dismissal held for this page.
  expect(await blockedAccesses()).toBeGreaterThan(beforeAccept);

  // Theme switching works for the current page even though each write fails.
  const beforeToggle = await blockedAccesses();
  await themeToggle.click();

  await expect(html).toHaveAttribute("data-theme", "dark");
  await expect(themeToggle).toHaveAttribute("aria-pressed", "true");
  await expect(themeToggle).toHaveAccessibleName("Włącz tryb jasny");
  await expect(themeColor).toHaveAttribute("content", "#171311");
  expect(await blockedAccesses()).toBeGreaterThan(beforeToggle);

  await themeToggle.click();

  await expect(html).toHaveAttribute("data-theme", "light");
  await expect(themeToggle).toHaveAttribute("aria-pressed", "false");
  await expect(themeToggle).toHaveAccessibleName("Włącz tryb ciemny");
  await expect(themeColor).toHaveAttribute("content", "#faf7f2");

  // Mobile navigation, initialized in `js/app.js` alongside the storage-dependent modules,
  // remains operable. The panel state is asserted on attributes, as in `tests/mobile-nav.spec.js`.
  const navToggle = page.getByRole("button", { name: "Przełącz menu nawigacji" });
  const panel = page.locator("[data-nav-panel]");

  await expect(navToggle).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("hidden", "");

  await navToggle.click();

  await expect(navToggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel).not.toHaveAttribute("hidden", "");
  await expect(panel).toHaveAttribute("data-open", "true");
  await expect(panel.getByRole("link", { name: "Strona główna" })).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(navToggle).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("hidden", "");
  await expect(navToggle).toBeFocused();

  expect(pageErrors).toEqual([]);
});
