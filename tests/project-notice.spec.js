import { expect, test } from "@playwright/test";
import { acceptProjectNotice, PROJECT_NOTICE_STORAGE_KEY } from "./support/app.js";

const projectNotice = (page) => page.getByRole("dialog", { name: "Informacja o projekcie" });

test("a first visit opens the project notice and Escape closes it", async ({ page }) => {
  // No seeding: the fresh context is exactly the unaccepted first-visit state the module reads.
  await page.goto("/");

  const dialog = projectNotice(page);

  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  // The notice opens itself on load, so there is no opener to restore focus to; the module
  // releases focus instead, which must leave it outside the now-hidden dialog.
  await expect(page.locator("body")).toBeFocused();
});

test("a stored acceptance keeps the project notice closed", async ({ page }) => {
  await acceptProjectNotice(page);
  await page.goto("/");

  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(projectNotice(page)).toBeHidden();
});

test("keyboard focus stays contained in the open project notice and wraps at both ends", async ({ page }) => {
  await page.goto("/");

  const dialog = projectNotice(page);
  const focusables = [
    dialog.getByRole("link", { name: "Regulamin" }),
    dialog.getByRole("link", { name: "Polityka prywatności" }),
    dialog.getByRole("link", { name: "Cookies" }),
    dialog.getByRole("button", { name: "Akceptuję" })
  ];
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const focusedInsideDialog = dialog.locator(":focus");

  await expect(dialog).toBeVisible();
  await expect(dialog).toBeFocused();

  // Entering from the programmatically focused container: Tab lands on the first element.
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();

  // Forward order through the dialog, then wraparound from the last element to the first.
  for (const element of focusables.slice(1)) {
    await page.keyboard.press("Tab");
    await expect(element).toBeFocused();
  }
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();

  // Backward wraparound from the first element to the last.
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();

  // Entering from the container in the other direction is independent of the forward entry,
  // so the container is refocused first: Shift+Tab lands on the last element.
  await dialog.focus();
  await expect(dialog).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(last).toBeFocused();

  // Repeated navigation in both directions, beyond one full cycle, never leaves the dialog.
  for (const key of ["Tab", "Shift+Tab"]) {
    for (let step = 0; step < focusables.length * 2 + 1; step += 1) {
      await page.keyboard.press(key);
      await expect(focusedInsideDialog).toHaveCount(1);
    }
  }
});

test("a click on the backdrop outside the dialog panel closes the project notice", async ({ page }) => {
  await page.goto("/");

  const dialog = projectNotice(page);
  const backdrop = page.locator("[data-project-notice-close]");

  await expect(dialog).toBeVisible();
  await expect(page.locator("body")).toHaveClass(/\bis-project-notice-open\b/);

  // The panel is centred, so the backdrop's top-left corner is outside it; Playwright's
  // actionability check confirms the backdrop itself receives the pointer there.
  await backdrop.click({ position: { x: 5, y: 5 } });

  await expect(dialog).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/\bis-project-notice-open\b/);
  await expect(page.locator("body")).toBeFocused();

  // With the trap released, keyboard focus moves into the page instead of the hidden notice.
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toHaveCount(1);
  await expect(page.locator("[data-project-notice] :focus")).toHaveCount(0);
});

test("accepting the project notice with its button persists across a reload", async ({ page }) => {
  // No seeding: acceptance must be written by the real button flow.
  await page.goto("/");

  const dialog = projectNotice(page);

  await expect(dialog).toBeVisible();

  await dialog.getByRole("button", { name: "Akceptuję" }).click();

  await expect(dialog).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/\bis-project-notice-open\b/);
  expect(
    await page.evaluate((key) => window.localStorage.getItem(key), PROJECT_NOTICE_STORAGE_KEY)
  ).toBe("true");

  await page.reload();

  // The notice markup is authored `hidden`, so its hidden state alone would pass before any
  // script runs. The theme toggle is initialized in the same synchronous step of `js/app.js`
  // that runs `initProjectNotice()` right after it, so its marker proves initialization ran.
  await expect(page.getByRole("banner").locator("[data-theme-toggle]")).toHaveAttribute("data-initialized", "true");
  await expect(dialog).toBeHidden();
  await expect(page.locator("body")).not.toHaveClass(/\bis-project-notice-open\b/);
});
