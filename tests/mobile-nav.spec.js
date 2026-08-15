import { expect, test } from "@playwright/test";
import { acceptProjectNotice } from "./support/app.js";

// `js/modules/nav.js` treats viewports of 1024px and below as mobile navigation.
test.use({ viewport: { width: 390, height: 844 } });

test("the mobile navigation opens from the toggle and closes with Escape", async ({ page }) => {
  await acceptProjectNotice(page);
  await page.goto("/");

  const toggle = page.getByRole("button", { name: "Przełącz menu nawigacji" });
  // The panel carries the open/closed state, and no role maps to that wrapper element.
  // Its closed state is authored as `hidden`, which the mobile stylesheet renders as an
  // off-canvas panel rather than `display: none`, so the state is asserted on the
  // attributes and on focus instead of on Playwright's visibility heuristic.
  const panel = page.locator("[data-nav-panel]");

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("hidden", "");

  await toggle.click();

  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(panel).not.toHaveAttribute("hidden", "");
  await expect(panel).toHaveAttribute("data-open", "true");
  await expect(panel.getByRole("link", { name: "Strona główna" })).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(panel).toHaveAttribute("hidden", "");
  await expect(toggle).toBeFocused();
});
