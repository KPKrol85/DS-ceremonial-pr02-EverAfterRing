import { expect, test } from "@playwright/test";
import { acceptProjectNotice } from "./support/app.js";

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
