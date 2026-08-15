import { expect, test } from "@playwright/test";
import { acceptProjectNotice } from "./support/app.js";

// The first card in the "Wybrane historie" grid, as `realizacje.html` authors it.
const FIRST_TITLE = "Royal Classic";
const FIRST_DESCRIPTION = "Pałacowa elegancja z akcentami złota i ciepłego światła.";

test("a portfolio image opens the shared lightbox and returns focus when it closes", async ({ page }) => {
  await acceptProjectNotice(page);
  await page.goto("/realizacje.html");

  const trigger = page.getByRole("button", { name: `Powiększ zdjęcie: ${FIRST_TITLE}` });
  // A closed `dialog` is out of the accessibility tree, so the element is addressed through its
  // authored hook and the dialog semantics are asserted as part of the contract.
  const lightbox = page.locator("[data-lightbox]");

  await expect(trigger).toBeVisible();
  await expect(lightbox).toBeHidden();

  await trigger.dblclick();

  await expect(lightbox).toBeVisible();
  await expect(lightbox).toHaveRole("dialog");
  await expect(lightbox).toHaveAccessibleName(FIRST_TITLE);
  await expect(lightbox.getByRole("heading", { name: FIRST_TITLE })).toBeVisible();
  await expect(lightbox.getByText(FIRST_DESCRIPTION)).toBeVisible();
  // The enlarged copy carries the card image's own alternative text.
  await expect(lightbox.getByRole("img", { name: "Klasyczna aranżacja sali balowej" })).toBeVisible();

  // A modal dialog moves focus into itself, and the close control is its first focusable element.
  const close = lightbox.getByRole("button", { name: "Zamknij powiększenie" });
  await expect(close).toBeFocused();

  await page.keyboard.press("Escape");

  await expect(lightbox).toBeHidden();
  await expect(trigger).toBeFocused();

  // Keyboard activation opens the same lightbox from a single key press.
  await page.keyboard.press("Enter");
  await expect(lightbox).toBeVisible();
  await close.click();
  await expect(lightbox).toBeHidden();
  await expect(trigger).toBeFocused();

  await page.keyboard.press(" ");
  await expect(lightbox).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(lightbox).toBeHidden();

  // A single mouse click is not an opening gesture; it is checked last so no later mouse
  // activity can extend it into a double-click.
  await trigger.click();
  await expect(lightbox).toBeHidden();
});
