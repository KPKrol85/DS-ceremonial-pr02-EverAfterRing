import { expect, test } from "@playwright/test";
import { acceptProjectNotice } from "./support/app.js";

test("the shared primary navigation reaches another MPA document", async ({ page }) => {
  await acceptProjectNotice(page);
  await page.goto("/");

  const primaryNavigation = page.getByRole("banner").getByRole("navigation", { name: "Główna nawigacja" });
  const offerLink = primaryNavigation.getByRole("link", { name: "Oferta", exact: true });

  await expect(offerLink).toBeVisible();
  await offerLink.click();

  await expect(page).toHaveURL(/\/oferta\.html$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Wybierz zakres wsparcia idealny dla Waszej historii.");

  // The build resolves the active primary-navigation state into the emitted document.
  await expect(primaryNavigation.getByRole("link", { name: "Oferta", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
});
