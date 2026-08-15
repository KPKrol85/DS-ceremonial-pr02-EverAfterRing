import { expect, test } from "@playwright/test";
import { acceptProjectNotice } from "./support/app.js";

// A representative subset of the maintained pages: the home page, a secondary public page and
// the contact page. Every one of them proves the same shared runtime contracts, so the suite
// does not repeat this check across all ten documents.
const pages = [
  {
    path: "/",
    title: "EverAfter Ring – Planowanie ślubów z klasą",
    heading: "EverAfter Ring – tworzymy śluby, które zostają w pamięci na zawsze."
  },
  {
    path: "/oferta.html",
    title: "Oferta – Pakiety EverAfter Ring",
    heading: "Wybierz zakres wsparcia idealny dla Waszej historii."
  },
  {
    path: "/kontakt.html",
    title: "Kontakt – EverAfter Ring",
    heading: "Opowiedz nam o swoim ślubie – przygotujemy spersonalizowaną ofertę."
  }
];

pages.forEach(({ path, title, heading }) => {
  test(`${path} renders its document and the shared shell`, async ({ page }) => {
    await acceptProjectNotice(page);

    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await page.goto(path);

    await expect(page).toHaveTitle(title);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);

    // Readiness evidence rather than a bare response check: the shared header and footer are
    // resolved into the document and the synchronous theme bootstrap has run.
    await expect(page.getByRole("banner").getByRole("navigation", { name: "Główna nawigacja" })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");

    expect(pageErrors).toEqual([]);
  });
});
