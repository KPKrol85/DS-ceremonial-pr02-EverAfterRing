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

// Fictional values that satisfy every constraint in `kontakt.html`: the `email` type, the
// 10–400 `guests` range, and an option of each required select chosen by its visible label.
const VALID_INQUIRY = {
  name: "Anna Kowalska",
  email: "anna.kowalska@example.com",
  date: "2027-06-19",
  city: "Kraków",
  budget: "50 000 – 80 000 zł",
  package: "Signature",
  guests: "120",
  message: "Planujemy przyjęcie w plenerze i prosimy o propozycję pakietu."
};

// The `action` of the contact form, which is also the Netlify Forms success page.
const FORM_ACTION = "/dziekujemy.html";

const contactForm = (page) => page.locator("form[data-contact-form]");

const fillValidInquiry = async (form, overrides = {}) => {
  const values = { ...VALID_INQUIRY, ...overrides };

  await form.getByRole("textbox", { name: "Imię i nazwisko" }).fill(values.name);
  await form.getByRole("textbox", { name: "Email", exact: true }).fill(values.email);
  await form.getByLabel("Data wydarzenia").fill(values.date);
  await form.getByRole("textbox", { name: "Miasto / region" }).fill(values.city);
  await form.getByRole("combobox", { name: "Budżet" }).selectOption({ label: values.budget });
  await form.getByRole("combobox", { name: "Preferowany pakiet" }).selectOption({ label: values.package });
  await form.getByRole("spinbutton", { name: "Liczba gości" }).fill(values.guests);
  await form.getByRole("textbox", { name: "Wiadomość" }).fill(values.message);
};

test("the form introduction names KP_Code Digital Studio as the recipient of a demonstration project", async ({ page }) => {
  await acceptProjectNotice(page);
  await page.goto("/kontakt.html");

  const formSection = page.locator("section").filter({ has: contactForm(page) });
  const disclosure = formSection.getByText("Formularz umożliwia przesłanie zapytania do autora projektu");

  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText("KP_Code Digital Studio");
  await expect(disclosure).toContainText("charakter demonstracyjny");
});

// Each case reaches one of the module's three message branches through the field's own constraint
// and leaves it on blur, which is where the module validates a single field outside a submit.
const fieldCases = [
  {
    title: "an email without a valid format",
    locate: (form) => form.getByRole("textbox", { name: "Email", exact: true }),
    makeInvalid: (field) => field.fill("anna.kowalska"),
    message: "Wprowadź poprawny format.",
    makeValid: (field) => field.fill(VALID_INQUIRY.email)
  },
  {
    title: "a guest count below the 10–400 range",
    locate: (form) => form.getByRole("spinbutton", { name: "Liczba gości" }),
    makeInvalid: (field) => field.fill("5"),
    message: "Sprawdź poprawność pola.",
    makeValid: (field) => field.fill(VALID_INQUIRY.guests)
  },
  {
    title: "a guest count above the 10–400 range",
    locate: (form) => form.getByRole("spinbutton", { name: "Liczba gości" }),
    makeInvalid: (field) => field.fill("401"),
    message: "Sprawdź poprawność pola.",
    makeValid: (field) => field.fill(VALID_INQUIRY.guests)
  },
  {
    title: "a required budget left on its placeholder option",
    locate: (form) => form.getByRole("combobox", { name: "Budżet" }),
    // The placeholder is the default selection, so focusing and leaving the select is enough.
    makeInvalid: (field) => field.focus(),
    message: "To pole jest wymagane.",
    makeValid: (field) => field.selectOption({ label: VALID_INQUIRY.budget })
  }
];

for (const { title, locate, makeInvalid, message, makeValid } of fieldCases) {
  test(`${title} is exposed as invalid and recovers once corrected`, async ({ page }) => {
    await acceptProjectNotice(page);
    await page.goto("/kontakt.html");

    const field = locate(contactForm(page));

    await makeInvalid(field);
    await field.blur();

    await expect(field).toHaveAttribute("aria-invalid", "true");
    await expect(field).toHaveAccessibleDescription(message);

    // The module clears the state on `input` as soon as the field's validity holds again.
    await makeValid(field);

    await expect(field).not.toHaveAttribute("aria-invalid");
    await expect(field).toHaveAccessibleDescription("");
  });
}

test("an invalid submit is prevented, announced, and focuses the first invalid field", async ({ page }) => {
  await acceptProjectNotice(page);

  // Only requests to the form action count: the embedded map issues POSTs of its own.
  const submissions = [];
  page.on("request", (request) => {
    if (request.method() === "POST" && new URL(request.url()).pathname === FORM_ACTION) {
      submissions.push(request.url());
    }
  });

  await page.goto("/kontakt.html");

  const form = contactForm(page);
  // Every field is valid except the email, so it is the first invalid field rather than `name`.
  await fillValidInquiry(form, { email: "anna.kowalska" });

  await form.getByRole("button", { name: "Wyślij zapytanie" }).click();

  const email = form.getByRole("textbox", { name: "Email", exact: true });

  await expect(form.locator("[data-form-status]")).toHaveText("Uzupełnij zaznaczone pola, aby wysłać zapytanie.");
  await expect(email).toBeFocused();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(email).toHaveAccessibleDescription("Wprowadź poprawny format.");
  await expect(form.locator("[data-validate][aria-invalid]")).toHaveCount(1);

  // The submit handler runs before any navigation starts, so a submission that was not prevented
  // would already have issued its POST by the time the status message is written.
  await expect(page).toHaveURL(/\/kontakt\.html$/);
  expect(submissions).toEqual([]);
});

test("a valid submit sends the Netlify Forms payload as a native POST to the success page", async ({ page }) => {
  await acceptProjectNotice(page);

  const submissions = [];
  // Only the form's own POST is intercepted. It is answered locally, so the test depends on
  // neither Netlify nor how Vite preview treats a POST to a static file.
  await page.route(`**${FORM_ACTION}`, async (route) => {
    const request = route.request();
    if (request.method() !== "POST") {
      await route.continue();
      return;
    }

    submissions.push({
      method: request.method(),
      url: request.url(),
      contentType: await request.headerValue("content-type"),
      body: request.postData() ?? ""
    });

    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><title>Dziękujemy</title>"
    });
  });

  await page.goto("/kontakt.html");

  const form = contactForm(page);
  await expect(form).toHaveAttribute("action", FORM_ACTION);
  await expect(form).toHaveAttribute("method", "POST");
  await fillValidInquiry(form);

  // The submit handler re-validates every field and prevents the submission if any is invalid,
  // so no invalid state before the click plus an issued POST means validation let it through.
  await expect(form.locator("[data-validate][aria-invalid]")).toHaveCount(0);

  await form.getByRole("button", { name: "Wyślij zapytanie" }).click();

  // The browser itself navigates to the action with the intercepted response.
  await page.waitForURL(`**${FORM_ACTION}`);

  expect(submissions).toHaveLength(1);
  const [submission] = submissions;

  expect(submission.method).toBe("POST");
  expect(new URL(submission.url).pathname).toBe(FORM_ACTION);
  expect(submission.contentType).toContain("application/x-www-form-urlencoded");

  const payload = new URLSearchParams(submission.body);

  expect(payload.get("form-name")).toBe("kontakt-everafterring");
  for (const [fieldName, value] of Object.entries(VALID_INQUIRY)) {
    expect(payload.get(fieldName), `submitted value of "${fieldName}"`).toBe(value);
  }
  // The honeypot must be sent, and sent empty, for Netlify to accept the submission as human.
  expect(payload.has("bot-field")).toBe(true);
  expect(payload.get("bot-field")).toBe("");
});
