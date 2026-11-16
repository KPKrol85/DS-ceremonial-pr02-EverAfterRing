import { expect, test } from "@playwright/test";
import { acceptProjectNotice, seedStorage, PROJECT_NOTICE_STORAGE_KEY, THEME_STORAGE_KEY } from "./support/app.js";

// Resolves a token from `css/tokens.css` under the active theme, so border expectations follow
// the theme instead of repeating its colour values here.
const resolveToken = (page, property, token) =>
  page.evaluate(
    ([cssProperty, name]) => {
      const probe = document.createElement("span");
      probe.style.setProperty(cssProperty, `var(${name})`);
      document.body.append(probe);
      const value = getComputedStyle(probe).getPropertyValue(cssProperty);
      probe.remove();
      return value;
    },
    [property, token]
  );

const borderColors = (field) =>
  field.evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.borderTopColor, style.borderRightColor, style.borderBottomColor, style.borderLeftColor];
  });

const expectBorderToken = async (field, token) => {
  const expected = await resolveToken(field.page(), "color", token);
  await expect.poll(() => borderColors(field)).toEqual([expected, expected, expected, expected]);
};

const NORMAL_BORDER = "--color-border-subtle";
const INVALID_BORDER = "--color-error";

// `js/modules/form.js` applies `novalidate` itself, so a submit with a required value missing is
// handled by the module rather than by the browser's own bubbles, and the state it writes is what
// assistive technology reads. This covers that state only, not the form's validation rules.
test("a submit with a required value missing exposes the first invalid field as invalid", async ({ page }) => {
  // The project notice traps focus while it is open, so the accepted state is seeded before load.
  await acceptProjectNotice(page);
  await page.goto("/kontakt.html");

  const name = page.getByRole("textbox", { name: "Imię i nazwisko" });

  await expect(name).not.toHaveAttribute("aria-invalid");
  // An untouched required field is not styled as invalid before the module marks it.
  await expectBorderToken(name, NORMAL_BORDER);

  await page.getByRole("button", { name: "Wyślij zapytanie" }).click();

  // `name` is the first `[data-validate]` field in the form, so it is the one the module reports.
  await expect(name).toHaveAttribute("aria-invalid", "true");
  await expect(name).toBeFocused();
  // Asserted through the computed description rather than through the error element, so the
  // existing `aria-describedby` relationship is part of what passes.
  await expect(name).toHaveAccessibleDescription("To pole jest wymagane.");
  await expectBorderToken(name, INVALID_BORDER);

  await name.fill("Anna Kowalska");

  // A field that became valid must not keep the invalid state, and its message is cleared with it.
  await expect(name).not.toHaveAttribute("aria-invalid");
  await expect(name).toHaveAccessibleDescription("");
  await expectBorderToken(name, NORMAL_BORDER);
});

for (const theme of ["light", "dark"]) {
  test(`invalid controls use the ${theme} error token without resizing and keep the focus ring`, async ({ page }) => {
    await seedStorage(page, { [PROJECT_NOTICE_STORAGE_KEY]: "true", [THEME_STORAGE_KEY]: theme });
    await page.goto("/kontakt.html");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);

    // The two tokens must differ, or the colour assertions below would not tell the states apart.
    expect(await resolveToken(page, "color", INVALID_BORDER)).not.toBe(
      await resolveToken(page, "color", NORMAL_BORDER)
    );

    const form = contactForm(page);
    // One control of each type that the invalid rule covers.
    const controls = [
      form.getByRole("textbox", { name: "Imię i nazwisko" }),
      form.getByRole("combobox", { name: "Budżet" }),
      form.getByRole("textbox", { name: "Wiadomość" })
    ];
    const phone = form.getByRole("textbox", { name: "Telefon (opcjonalnie)" });
    const sizeOf = (field) =>
      field.evaluate((element) => {
        const { width, height } = element.getBoundingClientRect();
        return { width, height };
      });

    const sizesBefore = [];
    for (const control of controls) {
      await expectBorderToken(control, NORMAL_BORDER);
      sizesBefore.push(await sizeOf(control));
    }

    await form.getByRole("button", { name: "Wyślij zapytanie" }).click();

    for (const [index, control] of controls.entries()) {
      await expect(control).toHaveAttribute("aria-invalid", "true");
      await expect(control).toHaveAccessibleDescription("To pole jest wymagane.");
      await expectBorderToken(control, INVALID_BORDER);
      expect(await sizeOf(control)).toEqual(sizesBefore[index]);
    }

    // The optional phone field is never validated, so it keeps its normal presentation.
    await expect(phone).not.toHaveAttribute("aria-invalid");
    await expectBorderToken(phone, NORMAL_BORDER);

    // Reach the invalid `name` field by keyboard: the error border and the separate focus ring
    // from `css/base.css` must both be present.
    const [name] = controls;
    await expect(name).toBeFocused();
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await expect(name).toBeFocused();
    expect(await name.evaluate((element) => element.matches(":focus-visible"))).toBe(true);
    const focusRing = await resolveToken(page, "box-shadow", "--focus-ring");
    expect(await name.evaluate((element) => getComputedStyle(element).boxShadow)).toBe(focusRing);
    await expectBorderToken(name, INVALID_BORDER);
  });
}

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

for (const packageName of ["Essential", "Signature", "Full Service"]) {
  test(`the ${packageName} inquiry link preselects its package in the contact form`, async ({ page }) => {
    await acceptProjectNotice(page);
    await page.goto("/oferta.html");

    const card = page.locator(".card--package").filter({ has: page.getByText(packageName, { exact: true }) });
    const inquiryLink = card.getByRole("link", { name: `Zapytaj o pakiet ${packageName}`, exact: true });
    const destination = `kontakt.html?package=${encodeURIComponent(packageName)}`;

    await expect(inquiryLink).toHaveAttribute("href", destination);
    await inquiryLink.click();

    await expect(page).toHaveURL(new URL(destination, page.url()).href);
    const packageSelect = contactForm(page).getByRole("combobox", { name: "Preferowany pakiet" });
    await expect(packageSelect).toHaveValue(packageName);
    await expect(packageSelect).toBeEnabled();
    await expect(packageSelect).not.toHaveAttribute("aria-invalid");
  });
}

const unselectedPackageCases = [
  { title: "a missing package parameter", query: "" },
  { title: "an unknown package parameter", query: "?package=Unknown" },
  { title: "an empty package parameter", query: "?package=" },
  { title: "a package parameter with different letter case", query: "?package=essential" },
  { title: "a package parameter with surrounding spaces", query: "?package=%20Essential%20" }
];

for (const { title, query } of unselectedPackageCases) {
  test(`${title} keeps the placeholder and required package validation`, async ({ page }) => {
    await acceptProjectNotice(page);

    const submissions = [];
    page.on("request", (request) => {
      if (request.method() === "POST" && new URL(request.url()).pathname === FORM_ACTION) {
        submissions.push(request.url());
      }
    });

    await page.goto(`/kontakt.html${query}`);

    const form = contactForm(page);
    const packageSelect = form.getByRole("combobox", { name: "Preferowany pakiet" });
    await expect(packageSelect).toHaveValue("");
    await expect(packageSelect.locator("option:checked")).toHaveText("Wybierz pakiet");
    await expect(packageSelect.locator("option")).toHaveCount(4);
    expect(await packageSelect.evaluate((select) => select.validity.valueMissing)).toBe(true);

    // All other required fields are valid, leaving the unchanged placeholder as the only error.
    await fillValidInquiry(form, { package: "Wybierz pakiet" });
    await form.getByRole("button", { name: "Wyślij zapytanie" }).click();

    await expect(packageSelect).toHaveValue("");
    await expect(packageSelect).toHaveAttribute("aria-invalid", "true");
    await expect(packageSelect).toHaveAccessibleDescription("To pole jest wymagane.");
    await expect(packageSelect).toBeFocused();
    await expect(form.locator("[data-validate][aria-invalid]")).toHaveCount(1);
    await expect(form.locator("[data-form-status]")).toHaveText("Uzupełnij zaznaczone pola, aby wysłać zapytanie.");
    expect(new URL(page.url()).pathname).toBe("/kontakt.html");
    expect(submissions).toEqual([]);
  });
}

test("a user can change a preselected package and submit the current value in the native Netlify payload", async ({ page }) => {
  await acceptProjectNotice(page);

  const submissions = [];
  await page.route(`**${FORM_ACTION}`, async (route) => {
    const request = route.request();
    if (request.method() !== "POST") {
      await route.continue();
      return;
    }

    submissions.push(request.postData() ?? "");
    await route.fulfill({
      status: 200,
      contentType: "text/html; charset=utf-8",
      body: "<!doctype html><title>Dziękujemy</title>"
    });
  });

  await page.goto("/kontakt.html?package=Essential");

  const form = contactForm(page);
  const packageSelect = form.getByRole("combobox", { name: "Preferowany pakiet" });
  await expect(packageSelect).toHaveValue("Essential");
  await expect(packageSelect).toBeEnabled();

  // The shared helper changes Essential to the valid inquiry's Signature through the select.
  await fillValidInquiry(form);
  await expect(packageSelect).toHaveValue(VALID_INQUIRY.package);
  await expect(page).toHaveURL(/\/kontakt\.html\?package=Essential$/);
  await form.getByRole("button", { name: "Wyślij zapytanie" }).click();
  await page.waitForURL(`**${FORM_ACTION}`);

  expect(submissions).toHaveLength(1);
  const payload = new URLSearchParams(submissions[0]);
  expect(payload.get("form-name")).toBe("kontakt-everafterring");
  expect(payload.get("package")).toBe(VALID_INQUIRY.package);
});

test("the form introduction names KP_Code Digital Studio as the recipient of a demonstration project", async ({ page }) => {
  await acceptProjectNotice(page);
  await page.goto("/kontakt.html");

  const formSection = page.locator("section").filter({ has: contactForm(page) });
  const disclosure = formSection.getByText("Formularz umożliwia przesłanie zapytania do autora projektu");

  await expect(disclosure).toBeVisible();
  await expect(disclosure).toContainText("KP_Code Digital Studio");
  await expect(disclosure).toContainText("charakter demonstracyjny");
});

// Each case reaches a message branch through the field's own constraint
// and leaves it on blur, which is where the module validates a single field outside a submit.
const fieldCases = [
  {
    title: "an email without a valid format",
    locate: (form) => form.getByRole("textbox", { name: "Email", exact: true }),
    makeInvalid: (field) => field.fill("anna.kowalska"),
    message: "Podaj poprawny adres e-mail, np. anna@example.com.",
    makeValid: (field) => field.fill(VALID_INQUIRY.email)
  },
  {
    title: "a guest count below the 10–400 range",
    locate: (form) => form.getByRole("spinbutton", { name: "Liczba gości" }),
    makeInvalid: (field) => field.fill("5"),
    message: "Podaj liczbę gości od 10 do 400.",
    makeValid: (field) => field.fill(VALID_INQUIRY.guests)
  },
  {
    title: "a guest count above the 10–400 range",
    locate: (form) => form.getByRole("spinbutton", { name: "Liczba gości" }),
    makeInvalid: (field) => field.fill("500"),
    message: "Podaj liczbę gości od 10 do 400.",
    makeValid: (field) => field.fill(VALID_INQUIRY.guests)
  },
  {
    title: "a guest count outside dynamically changed limits",
    locate: (form) => form.getByRole("spinbutton", { name: "Liczba gości" }),
    makeInvalid: async (field) => {
      await field.evaluate((input) => {
        input.min = "20";
        input.max = "200";
      });
      await field.fill("5");
    },
    message: "Podaj liczbę gości od 20 do 200.",
    makeValid: (field) => field.fill(VALID_INQUIRY.guests)
  },
  ...["min", "max"].map((boundary) => ({
    title: `a guest range error without the ${boundary} boundary`,
    locate: (form) => form.getByRole("spinbutton", { name: "Liczba gości" }),
    makeInvalid: async (field) => {
      await field.evaluate((input, attribute) => input.removeAttribute(attribute), boundary);
      await field.fill(boundary === "min" ? "500" : "5");
    },
    message: "Sprawdź poprawność pola.",
    makeValid: (field) => field.fill(VALID_INQUIRY.guests)
  })),
  {
    title: "a guest count with an unsupported step mismatch",
    locate: (form) => form.getByRole("spinbutton", { name: "Liczba gości" }),
    makeInvalid: (field) => field.fill("10.5"),
    message: "Sprawdź poprawność pola.",
    makeValid: (field) => field.fill(VALID_INQUIRY.guests)
  },
  {
    title: "a non-email type mismatch",
    locate: (form) => form.getByRole("textbox", { name: "Email", exact: true }),
    makeInvalid: async (field) => {
      await field.evaluate((input) => {
        input.type = "url";
      });
      await field.fill("invalid-url");
    },
    message: "Wprowadź poprawny format.",
    makeValid: (field) => field.fill("https://example.com")
  },
  {
    title: "a required budget left on its placeholder option",
    locate: (form) => form.getByRole("combobox", { name: "Budżet" }),
    // The placeholder is the default selection, so focusing and leaving the select is enough.
    makeInvalid: (field) => field.focus(),
    message: "To pole jest wymagane.",
    makeValid: (field) => field.selectOption({ label: VALID_INQUIRY.budget })
  },
  {
    title: "a required message left empty",
    locate: (form) => form.getByRole("textbox", { name: "Wiadomość" }),
    makeInvalid: (field) => field.focus(),
    message: "To pole jest wymagane.",
    makeValid: (field) => field.fill(VALID_INQUIRY.message)
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
    await expectBorderToken(field, INVALID_BORDER);

    // The module clears the state on `input` as soon as the field's validity holds again.
    await makeValid(field);

    await expect(field).not.toHaveAttribute("aria-invalid");
    await expect(field).toHaveAccessibleDescription("");
    await expectBorderToken(field, NORMAL_BORDER);
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
  await expect(email).toHaveAccessibleDescription("Podaj poprawny adres e-mail, np. anna@example.com.");
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
