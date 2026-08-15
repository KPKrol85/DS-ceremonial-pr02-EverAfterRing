import { expect, test } from "@playwright/test";
import { acceptProjectNotice } from "./support/app.js";

// `js/modules/form.js` applies `novalidate` itself, so a submit with a required value missing is
// handled by the module rather than by the browser's own bubbles, and the state it writes is what
// assistive technology reads. This covers that state only, not the form's validation rules.
test("a submit with a required value missing exposes the first invalid field as invalid", async ({ page }) => {
  // The project notice traps focus while it is open, so the accepted state is seeded before load.
  await acceptProjectNotice(page);
  await page.goto("/kontakt.html");

  const name = page.getByRole("textbox", { name: "Imię i nazwisko" });

  await expect(name).not.toHaveAttribute("aria-invalid");

  await page.getByRole("button", { name: "Wyślij zapytanie" }).click();

  // `name` is the first `[data-validate]` field in the form, so it is the one the module reports.
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  // Asserted through the computed description rather than through the error element, so the
  // existing `aria-describedby` relationship is part of what passes.
  await expect(name).toHaveAccessibleDescription("To pole jest wymagane.");

  await name.fill("Anna Kowalska");

  // A field that became valid must not keep the invalid state, and its message is cleared with it.
  await expect(name).not.toHaveAttribute("aria-invalid");
  await expect(name).toHaveAccessibleDescription("");
});
