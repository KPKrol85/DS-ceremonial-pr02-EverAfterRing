# EverAfter Ring

## PL

### Przegląd projektu

EverAfter Ring to statyczny, wielostronicowy serwis w języku polskim, zbudowany w HTML, CSS i Vanilla JavaScript, bez zależności runtime. Repozytorium zawiera dziesięć stron w katalogu głównym: stronę główną, ofertę, usługi, realizacje, stronę o zespole, formularz kontaktowy, potwierdzenie wysłania formularza oraz trzy dokumenty prawne.

Projekt jest realizacją referencyjną KP_Code Digital Studio przedstawiającą przykładowy serwis dla branży ślubnej. Charakter demonstracyjny jest zakomunikowany w samym interfejsie — modal „Informacja o projekcie” w `partials/footer.html` oraz strony prawne opisują serwis jako projekt portfolio, a nie działającą firmę.

Wspólny nagłówek i stopka są utrzymywane jako partiale i mają dwa tryby dostarczania: w trybie źródłowym są pobierane przez `fetch`, a w buildzie produkcyjnym wstawiane bezpośrednio do plików HTML. Wersja produkcyjna jest generowana skryptami Node do katalogu `dist/`.

### Wersja online

[https://ceremonial-pr02-everafterring.netlify.app/](https://ceremonial-pr02-everafterring.netlify.app/)

Ten adres jest zadeklarowany jako kanoniczny w metadanych wszystkich stron, w `robots.txt` oraz w `sitemap.xml`. Podczas przygotowania tego dokumentu adres zwracał stronę główną EverAfter Ring.

### Kluczowe funkcje

- Wielostronicowa struktura oparta na plikach HTML w katalogu głównym, bez routingu klienckiego.
- Wspólny `header` i `footer` z `partials/`, z automatycznym oznaczaniem aktywnej strony przez `aria-current="page"` — w trybie źródłowym na podstawie `window.location`, a w buildzie na podstawie nazwy pliku.
- Nawigacja mobilna poniżej progu 1024 px: `aria-expanded`, `aria-controls`, pułapka fokusa, zamykanie klawiszem `Escape`, kliknięciem linku i przy zmianie szerokości okna.
- Przełącznik motywu jasnego i ciemnego zapisywany w `localStorage` pod kluczem `everafterring-theme`, z synchronizacją między kartami przez zdarzenie `storage` i aktualizacją `meta[name="theme-color"]`.
- Osobny skrypt `js/theme-bootstrap.js` ładowany synchronicznie w `<head>` przed arkuszem stylów, ustawiający `data-theme` na `<html>`; przy braku zapisanego wyboru bierze pod uwagę `prefers-color-scheme`.
- Formularz kontaktowy z walidacją po stronie klienta (`novalidate`, komunikaty per pole, fokus na pierwszym niepoprawnym polu) oraz statusem `aria-live="polite"`; wysyłka jest obsługiwana przez Netlify Forms z honeypotem i przekierowaniem na `dziekujemy.html`.
- Modal informacji o projekcie (`role="dialog"`, `aria-modal="true"`) z zapisem akceptacji w `localStorage` pod kluczem `everafterringProjectNoticeAccepted` i przywróceniem wcześniejszego fokusa.
- Zmiana stanu nagłówka przy przewijaniu z histerezą (klasa dodawana powyżej 96 px, usuwana poniżej 48 px), aktualizowana w `requestAnimationFrame`.
- Ruch obrazu hero sterowany kursorem, uruchamiany i zatrzymywany zgodnie z aktualnym stanem `prefers-reduced-motion`.
- Osadzona mapa Google Maps na stronie kontaktowej wraz z linkiem otwierającym tę samą lokalizację w nowej karcie.

### Stack technologiczny

**Runtime**

- HTML5
- CSS z własnymi właściwościami i warstwowymi importami
- Vanilla JavaScript jako ES modules
- brak zależności runtime i brak frameworka

**Build tooling**

- Node.js i npm
- `esbuild` `^0.28.0`
- `lightningcss` `^1.32.0`
- `sharp` `^0.34.5`
- własne skrypty `scripts/build.mjs` i `scripts/optimize-images.mjs`

**Podgląd lokalny**

- `python -m http.server` uruchamiany przez `start-local-preview.bat`

**Assety i metadane**

- JPG, WebP, AVIF, SVG
- lokalne fonty WOFF2 (Cormorant Garamond, Inter)
- `robots.txt`, `sitemap.xml`
- dane strukturalne JSON-LD
- `assets/favicon/site.webmanifest`

**Usługi zewnętrzne w markupie**

- Netlify Forms (atrybuty formularza kontaktowego)
- Google Maps (osadzony `iframe` na `kontakt.html`)

### Architektura

- **Strony** — każda strona to samodzielny plik HTML w katalogu głównym z pełnym zestawem metadanych i własną treścią; `main` jest celem linku pomijającego `#main`.
- **Partiale** — `header` i `footer` to hosty z atrybutami `data-partial` i `data-partial-src`. `js/modules/partials.js` pobiera je przez `fetch` i oznacza aktywny link, a `scripts/build.mjs` zastępuje te hosty gotowym markupem podczas builda. Oznacza to, że tryb źródłowy wymaga serwera HTTP.
- **CSS** — `css/main.css` jest jedynym punktem wejścia i importuje kolejno tokeny, fonty, bazę, layout, komponenty i sekcje. Wartości motywu są zdefiniowane jako właściwości custom w `css/tokens.css`, a wariant ciemny jako `:root[data-theme="dark"]`.
- **JavaScript** — `js/app.js` jest punktem wejścia i po `DOMContentLoaded` uruchamia moduły w ustalonej kolejności: partiale, motyw, nagłówek, nawigacja, formularz, hero, modal projektu. Wspólne selektory są w `js/config.js`, pomocnicze funkcje DOM i pułapka fokusa w `js/utils.js`, a logika interakcji w `js/modules/`.
- **Dwa punkty wejścia JS** — `js/app.js` bundlowany jako ESM oraz `js/theme-bootstrap.js` bundlowany jako IIFE, ponieważ musi wykonać się synchronicznie przed renderowaniem stylów.
- **Obrazy** — pliki źródłowe znajdują się w `assets/img-src/`, a warianty generowane przez `scripts/optimize-images.mjs` w `assets/img/`. W markupie używany jest element `picture` z kolejnością AVIF, WebP i JPG.
- **Build** — `scripts/build.mjs` generuje katalog `dist/`, który jest wykluczony z repozytorium przez `.gitignore` i nie powinien być edytowany ręcznie.

### Struktura projektu

```text
.
├── assets/
│   ├── favicon/            # favicony, ikony PWA, zrzuty ekranu, site.webmanifest
│   ├── fonts/              # lokalne subsety WOFF2
│   ├── img/                # wygenerowane warianty obrazów (JPG, WebP, AVIF)
│   ├── img-src/            # źródłowe obrazy hero i portfolio
│   ├── logo/
│   ├── og-img/
│   ├── placeholders/
│   └── svg/
├── css/
│   ├── components/         # nav, buttons, cards, forms, footer, badges, lists, project-notice
│   ├── sections/           # hero, process, testimonials, callout
│   ├── base.css
│   ├── fonts.css
│   ├── layout.css
│   ├── main.css            # jedyny punkt wejścia CSS
│   └── tokens.css
├── js/
│   ├── modules/            # partials, nav, theme, form, hero, header-scroll, project-notice, dom
│   ├── app.js              # punkt wejścia ESM
│   ├── config.js
│   ├── theme-bootstrap.js  # osobny punkt wejścia (IIFE)
│   └── utils.js
├── partials/
│   ├── footer.html         # stopka i modal informacji o projekcie
│   └── header.html         # nagłówek, nawigacja, przełącznik motywu
├── scripts/
│   ├── build.mjs           # clean, css, js, html, assets, build
│   └── optimize-images.mjs
├── index.html
├── oferta.html
├── uslugi.html
├── realizacje.html
├── o-nas.html
├── kontakt.html
├── dziekujemy.html
├── polityka-prywatnosci.html
├── regulamin.html
├── cookies.html
├── robots.txt
├── sitemap.xml
├── start-local-preview.bat
├── package.json
├── CHANGELOG.md
└── LICENSE
```

### Instalacja

Zależności są potrzebne wyłącznie do builda produkcyjnego i optymalizacji obrazów. Serwis w trybie źródłowym działa bez nich.

```bash
npm install
```

Konfiguracja środowiska Codex w `.codex/environments/environment.toml` instaluje zależności komendą `npm ci`.

### Development lokalny

```bat
start-local-preview.bat
```

Skrypt uruchamia w katalogu projektu:

```bash
python -m http.server 8181
```

Podgląd jest dostępny pod adresem `http://localhost:8181/`. Serwer HTTP jest wymagany, ponieważ moduły ES i partiale pobierane przez `fetch` nie działają przy otwarciu plików przez `file://`.

### Dostępne skrypty

| Skrypt | Działanie |
| --- | --- |
| `npm run clean` | Usuwa katalog `dist/`. |
| `npm run optimize:images` | Generuje warianty obrazów z `assets/img-src/` do `assets/img/`. |
| `npm run build:css` | Bundluje i minifikuje `css/main.css` do `dist/css/main.min.css`. |
| `npm run build:js` | Bundluje i minifikuje `js/app.js` oraz `js/theme-bootstrap.js` do `dist/js/`. |
| `npm run build:html` | Wstawia partiale i podmienia odwołania do plików produkcyjnych. |
| `npm run build:assets` | Kopiuje `assets/` (bez `img-src/`), `robots.txt` i `sitemap.xml` do `dist/`. |
| `npm run build` | Uruchamia optymalizację obrazów, a następnie pełny build. |

### Build produkcyjny

```bash
npm run build
```

Przebieg pełnego builda:

1. Generowanie wariantów obrazów w szerokościach 400, 800 i 1200 px (oraz w szerokości źródłowej, jeśli jest mniejsza) w formatach JPG, WebP i AVIF.
2. Usunięcie katalogu `dist/`.
3. Bundlowanie i minifikacja CSS do `dist/css/main.min.css`.
4. Bundlowanie i minifikacja JavaScriptu do `dist/js/app.min.js` (ESM) oraz `dist/js/theme-bootstrap.min.js` (IIFE).
5. Wstawienie partiali do dziesięciu stron HTML i podmiana odwołań `css/main.css`, `js/app.js` i `js/theme-bootstrap.js` na pliki `.min`.
6. Skopiowanie assetów oraz `robots.txt` i `sitemap.xml` do `dist/`.

Etap HTML zawiera własne kontrole spójności i przerywa build błędem, gdy w pliku źródłowym brakuje hosta partiala lub gdy na stronie należącej do nawigacji głównej nie ma dokładnie jednego linku `nav__link` z `aria-current="page"`.

Build nie był uruchamiany w ramach przygotowania tego dokumentu, ponieważ `npm run build` nadpisuje wersjonowane pliki w `assets/img/`.

### Wdrożenie

- Artefaktem przeznaczonym do hostingu jest katalog `dist/`, generowany komendą `npm run build`. Katalog jest wykluczony z repozytorium, więc wdrożenie wymaga wykonania builda.
- Repozytorium nie zawiera pliku konfiguracji hostingu (na przykład `netlify.toml`) — ustawienia builda i publikacji są utrzymywane poza repozytorium.
- Formularz kontaktowy jest przygotowany pod Netlify Forms: `data-netlify="true"`, `netlify-honeypot="bot-field"`, ukryte pole `form-name` oraz `action="/dziekujemy.html"`. Poza środowiskiem obsługującym Netlify Forms wysyłka nie zostanie przetworzona.
- Adresy kanoniczne, `og:url`, `robots.txt` i `sitemap.xml` wskazują na origin `https://ceremonial-pr02-everafterring.netlify.app`.

### Dostępność

- Każda strona zawiera link pomijający prowadzący do `#main`, z widocznym stanem `:focus-visible`.
- Layout korzysta z semantycznych elementów `header`, `nav`, `main` i `footer`; grupy linków w stopce mają własne etykiety `aria-label`.
- Przycisk nawigacji używa `aria-expanded` i `aria-controls`, a aktywna pozycja menu jest oznaczana `aria-current="page"`.
- Otwarty panel nawigacji mobilnej przenosi fokus na pierwszy element interaktywny i utrzymuje go w pułapce fokusa (`js/utils.js`), a zamknięcie przywraca fokus na przycisk.
- Modal informacji o projekcie ma `role="dialog"`, `aria-modal="true"`, powiązany tytuł i opis oraz przywraca poprzedni fokus.
- `css/base.css` definiuje wspólny styl `:focus-visible` dla linków, przycisków i pól formularza.
- Redukcja ruchu jest obsługiwana zarówno w CSS (`css/base.css`, `css/components/nav.css`, `css/components/project-notice.css`), jak i w module hero, który nasłuchuje zmian `prefers-reduced-motion`.
- Formularz kontaktowy używa powiązanych etykiet, `aria-describedby` dla komunikatów błędów i regionu statusu `aria-live="polite"`.
- Przełącznik motywu komunikuje stan przez `aria-pressed` i aktualizowaną etykietę `aria-label`.

Zakres nie obejmuje formalnego audytu zgodności — powyższe punkty opisują zaimplementowane mechanizmy.

### SEO

- Wszystkie dziesięć stron ma własny `title`, `meta name="description"` i `link rel="canonical"`.
- Każda strona zawiera pełny zestaw metadanych Open Graph (wraz z wymiarami i typem obrazu) oraz Twitter Card `summary_large_image`.
- Każda strona zawiera dwa bloki JSON-LD: `LocalBusiness` i `WebSite`.
- `robots.txt` zezwala na indeksowanie całego serwisu i wskazuje `sitemap.xml`.
- `sitemap.xml` zawiera dziewięć adresów — wszystkie strony poza `dziekujemy.html`.
- Żadna strona nie używa `meta name="robots"`, więc indeksowanie zależy wyłącznie od `robots.txt` i decyzji wyszukiwarki.

### PWA i obsługa offline

- `assets/favicon/site.webmanifest` definiuje `name`, `short_name`, `description`, `start_url` `/index.html`, `scope` `/`, `display` `standalone`, kolory oraz ikony 96, 180, 192 i 512 px.
- Manifest zawiera trzy skróty (Oferta, Realizacje, Kontakt) z własnymi ikonami oraz dwa zrzuty ekranu (wide 1440×900 i mobile 390×844).
- Strony deklarują `meta name="theme-color"` aktualizowany razem ze zmianą motywu.
- Repozytorium nie zawiera service workera ani rejestracji service workera, dlatego serwis nie udostępnia cache'owania offline.

### Wydajność

- Build produkcyjny minifikuje CSS (`lightningcss`) i JavaScript (`esbuild`).
- Obrazy są dostarczane przez element `picture` z wariantami AVIF i WebP oraz fallbackiem JPG; `srcset` i `sizes` są zdefiniowane dla każdego wariantu.
- Obrazy mają jawne atrybuty `width` i `height` oraz `decoding="async"`; obrazy poza pierwszym widokiem używają `loading="lazy"`.
- `scripts/optimize-images.mjs` zapisuje JPG z `quality: 82` i `mozjpeg`, WebP z `quality: 80` oraz AVIF z `quality: 50`, bez powiększania obrazów źródłowych.
- Fonty są hostowane lokalnie jako subsety WOFF2 z `font-display: swap` i podziałem `unicode-range` na `latin` oraz `latin-ext`.
- Runtime nie zawiera zależności zewnętrznych ani frameworka.

Repozytorium nie zawiera wyników pomiarów wydajności, dlatego powyższe punkty opisują wyłącznie zaimplementowane mechanizmy.

### Dane i trwałość stanu

- Treść stron jest statyczna i zapisana bezpośrednio w plikach HTML. Projekt nie zawiera backendu, bazy danych, kont użytkowników ani komunikacji z API.
- Serwis zapisuje w przeglądarce dokładnie dwa wpisy `localStorage`: `everafterring-theme` (wybrany motyw) oraz `everafterringProjectNoticeAccepted` (potwierdzenie zamknięcia modala). Oba są opisane w `cookies.html`.
- Zapis motywu jest odporny na brak dostępu do `localStorage` — przełącznik działa wtedy w obrębie bieżącej strony.
- Dane z formularza kontaktowego nie są przechowywane w przeglądarce; ich przetwarzanie zależy od Netlify Forms po stronie hostingu.

### Utrzymanie projektu

- Treść stron edytuje się w plikach HTML w katalogu głównym.
- Zmiany w nagłówku, nawigacji, stopce lub modalu projektu należy wprowadzać w `partials/header.html` i `partials/footer.html`, nigdy w poszczególnych stronach.
- Nowa strona wymaga dodania wpisu w tablicy `htmlPages` w `scripts/build.mjs`, a strona należąca do nawigacji głównej dodatkowo w `primaryNavPages` oraz w `partials/header.html`; adresy publiczne dodaje się do `sitemap.xml`.
- Nowy plik CSS wymaga zarejestrowania importu w `css/main.css`, a nowy moduł JS — wywołania w `js/app.js`.
- Selektory współdzielone między modułami są zdefiniowane w `js/config.js`.
- Nowe obrazy dodaje się do `assets/img-src/` i generuje komendą `npm run optimize:images`; katalog `assets/img/` zawiera pliki wygenerowane, ale wersjonowane w repozytorium.
- Katalog `dist/` jest generowany i wykluczony z repozytorium — nie należy edytować go ręcznie.
- Klucze `localStorage` są zduplikowane w `js/theme-bootstrap.js` i `js/modules/theme.js`; zmiana klucza wymaga aktualizacji obu plików oraz dokumentów prawnych, które go opisują.

### Licencja

Projekt jest objęty własnościową licencją KP_Code (wersja 1.0) opisaną w [LICENSE](LICENSE). Nie jest to licencja open source ani przekazanie do domeny publicznej; `package.json` deklaruje `SEE LICENSE IN LICENSE`.

Licencja jest dwujęzyczna, a w razie rozbieżności rozstrzygająca jest wersja polska. Właścicielem praw jest Kamil Król — KP_Code.

### Atrybucje

Materiały podmiotów trzecich pozostają objęte własnymi licencjami — zasady opisuje sekcja 8 pliku [LICENSE](LICENSE). Repozytorium hostuje lokalnie subsety fontów Cormorant Garamond i Inter w `assets/fonts/`, deklarowane w `css/fonts.css`.

## EN

### Project Overview

EverAfter Ring is a static, multi-page website in Polish, built with HTML, CSS, and Vanilla JavaScript, with no runtime dependencies. The repository contains ten top-level pages: home, offer, services, portfolio, about, contact form, form confirmation, and three legal documents.

The project is a KP_Code Digital Studio reference build that demonstrates a website for the wedding industry. Its demonstration character is stated in the interface itself — the "Informacja o projekcie" modal in `partials/footer.html` and the legal pages describe the site as a portfolio project rather than an operating business.

The shared header and footer are maintained as partials with two delivery modes: they are fetched at runtime in source mode and inlined into the HTML files during the production build. The production version is generated by Node scripts into `dist/`.

### Live Version

[https://ceremonial-pr02-everafterring.netlify.app/](https://ceremonial-pr02-everafterring.netlify.app/)

This address is declared as canonical in the metadata of every page, in `robots.txt`, and in `sitemap.xml`. While this document was prepared, the address returned the EverAfter Ring home page.

### Key Features

- Multi-page structure based on top-level HTML files, without client-side routing.
- Shared `header` and `footer` from `partials/`, with the active page marked by `aria-current="page"` — derived from `window.location` in source mode and from the file name during the build.
- Mobile navigation below the 1024 px threshold: `aria-expanded`, `aria-controls`, focus trap, and closing via `Escape`, a link click, or a window resize.
- Light/dark theme toggle persisted in `localStorage` under the `everafterring-theme` key, synchronized across tabs through the `storage` event and reflected in `meta[name="theme-color"]`.
- A separate `js/theme-bootstrap.js` script loaded synchronously in `<head>` before the stylesheet, setting `data-theme` on `<html>`; with no stored choice it falls back to `prefers-color-scheme`.
- Contact form with client-side validation (`novalidate`, per-field messages, focus on the first invalid field) and an `aria-live="polite"` status region; submission is handled by Netlify Forms with a honeypot and a redirect to `dziekujemy.html`.
- Project notice modal (`role="dialog"`, `aria-modal="true"`) with acceptance stored in `localStorage` under the `everafterringProjectNoticeAccepted` key and previous focus restored.
- Header scroll state with hysteresis (class added above 96 px, removed below 48 px), updated inside `requestAnimationFrame`.
- Pointer-driven hero image motion, started and stopped according to the current `prefers-reduced-motion` state.
- Embedded Google Maps frame on the contact page, together with a link that opens the same location in a new tab.

### Tech Stack

**Runtime**

- HTML5
- CSS with custom properties and layered imports
- Vanilla JavaScript as ES modules
- no runtime dependencies and no framework

**Build tooling**

- Node.js and npm
- `esbuild` `^0.28.0`
- `lightningcss` `^1.32.0`
- `sharp` `^0.34.5`
- custom scripts in `scripts/build.mjs` and `scripts/optimize-images.mjs`

**Local preview**

- `python -m http.server` started through `start-local-preview.bat`

**Assets and metadata**

- JPG, WebP, AVIF, SVG
- local WOFF2 fonts (Cormorant Garamond, Inter)
- `robots.txt`, `sitemap.xml`
- JSON-LD structured data
- `assets/favicon/site.webmanifest`

**External services referenced in the markup**

- Netlify Forms (contact form attributes)
- Google Maps (embedded `iframe` on `kontakt.html`)

### Architecture

- **Pages** — each page is a standalone HTML file at the repository root with a full metadata set and its own content; `main` is the target of the `#main` skip link.
- **Partials** — `header` and `footer` are host elements carrying `data-partial` and `data-partial-src`. `js/modules/partials.js` fetches them and marks the active link, while `scripts/build.mjs` replaces those hosts with the resolved markup during the build. Source mode therefore requires an HTTP server.
- **CSS** — `css/main.css` is the single entry point and imports tokens, fonts, base, layout, components, and sections in order. Theme values are defined as custom properties in `css/tokens.css`, with the dark variant under `:root[data-theme="dark"]`.
- **JavaScript** — `js/app.js` is the entry point and, after `DOMContentLoaded`, runs the modules in a fixed order: partials, theme, header, navigation, form, hero, project notice. Shared selectors live in `js/config.js`, DOM helpers and the focus trap in `js/utils.js`, and interaction logic in `js/modules/`.
- **Two JS entry points** — `js/app.js` is bundled as ESM and `js/theme-bootstrap.js` as an IIFE, because it must run synchronously before styles render.
- **Images** — source files live in `assets/img-src/`, and the variants generated by `scripts/optimize-images.mjs` in `assets/img/`. The markup uses the `picture` element with AVIF, WebP, and JPG in that order.
- **Build** — `scripts/build.mjs` generates the `dist/` directory, which is excluded from the repository by `.gitignore` and should not be edited manually.

### Project Structure

```text
.
├── assets/
│   ├── favicon/            # favicons, PWA icons, screenshots, site.webmanifest
│   ├── fonts/              # local WOFF2 subsets
│   ├── img/                # generated image variants (JPG, WebP, AVIF)
│   ├── img-src/            # hero and portfolio image sources
│   ├── logo/
│   ├── og-img/
│   ├── placeholders/
│   └── svg/
├── css/
│   ├── components/         # nav, buttons, cards, forms, footer, badges, lists, project-notice
│   ├── sections/           # hero, process, testimonials, callout
│   ├── base.css
│   ├── fonts.css
│   ├── layout.css
│   ├── main.css            # single CSS entry point
│   └── tokens.css
├── js/
│   ├── modules/            # partials, nav, theme, form, hero, header-scroll, project-notice, dom
│   ├── app.js              # ESM entry point
│   ├── config.js
│   ├── theme-bootstrap.js  # separate entry point (IIFE)
│   └── utils.js
├── partials/
│   ├── footer.html         # footer and project notice modal
│   └── header.html         # header, navigation, theme toggle
├── scripts/
│   ├── build.mjs           # clean, css, js, html, assets, build
│   └── optimize-images.mjs
├── index.html
├── oferta.html
├── uslugi.html
├── realizacje.html
├── o-nas.html
├── kontakt.html
├── dziekujemy.html
├── polityka-prywatnosci.html
├── regulamin.html
├── cookies.html
├── robots.txt
├── sitemap.xml
├── start-local-preview.bat
├── package.json
├── CHANGELOG.md
└── LICENSE
```

### Installation

Dependencies are required only for the production build and image optimization. The site runs in source mode without them.

```bash
npm install
```

The Codex environment configuration in `.codex/environments/environment.toml` installs dependencies with `npm ci`.

### Local Development

```bat
start-local-preview.bat
```

The script runs, in the project directory:

```bash
python -m http.server 8181
```

The preview is available at `http://localhost:8181/`. An HTTP server is required because ES modules and partials fetched at runtime do not work when files are opened over `file://`.

### Available Scripts

| Script | Behavior |
| --- | --- |
| `npm run clean` | Removes the `dist/` directory. |
| `npm run optimize:images` | Generates image variants from `assets/img-src/` into `assets/img/`. |
| `npm run build:css` | Bundles and minifies `css/main.css` into `dist/css/main.min.css`. |
| `npm run build:js` | Bundles and minifies `js/app.js` and `js/theme-bootstrap.js` into `dist/js/`. |
| `npm run build:html` | Inlines the partials and switches references to the production files. |
| `npm run build:assets` | Copies `assets/` (excluding `img-src/`), `robots.txt`, and `sitemap.xml` into `dist/`. |
| `npm run build` | Runs image optimization and then the full build. |

### Production Build

```bash
npm run build
```

Full build sequence:

1. Generating image variants at 400, 800, and 1200 px widths (plus the source width when it is smaller) in JPG, WebP, and AVIF.
2. Removing the `dist/` directory.
3. Bundling and minifying CSS into `dist/css/main.min.css`.
4. Bundling and minifying JavaScript into `dist/js/app.min.js` (ESM) and `dist/js/theme-bootstrap.min.js` (IIFE).
5. Inlining the partials into the ten HTML pages and rewriting `css/main.css`, `js/app.js`, and `js/theme-bootstrap.js` references to the `.min` files.
6. Copying the assets plus `robots.txt` and `sitemap.xml` into `dist/`.

The HTML stage includes its own consistency checks and fails the build when a partial host is missing from a source file, or when a page belonging to the primary navigation does not contain exactly one `nav__link` with `aria-current="page"`.

The build was not executed while this document was prepared, because `npm run build` overwrites version-controlled files in `assets/img/`.

### Deployment

- The artifact intended for hosting is the `dist/` directory, generated by `npm run build`. The directory is excluded from the repository, so deployment requires running the build.
- The repository contains no hosting configuration file (for example `netlify.toml`) — build and publish settings are maintained outside the repository.
- The contact form is prepared for Netlify Forms: `data-netlify="true"`, `netlify-honeypot="bot-field"`, a hidden `form-name` field, and `action="/dziekujemy.html"`. Outside an environment that supports Netlify Forms, submissions will not be processed.
- Canonical URLs, `og:url`, `robots.txt`, and `sitemap.xml` all point to the `https://ceremonial-pr02-everafterring.netlify.app` origin.

### Accessibility

- Every page includes a skip link targeting `#main`, with a visible `:focus-visible` state.
- The layout uses semantic `header`, `nav`, `main`, and `footer` elements; footer link groups carry their own `aria-label`.
- The navigation button uses `aria-expanded` and `aria-controls`, and the active menu item is marked with `aria-current="page"`.
- The open mobile navigation panel moves focus to the first interactive element and keeps it in a focus trap (`js/utils.js`), and closing restores focus to the button.
- The project notice modal uses `role="dialog"`, `aria-modal="true"`, an associated title and description, and restores the previous focus.
- `css/base.css` defines a shared `:focus-visible` style for links, buttons, and form fields.
- Reduced motion is handled both in CSS (`css/base.css`, `css/components/nav.css`, `css/components/project-notice.css`) and in the hero module, which listens for `prefers-reduced-motion` changes.
- The contact form uses associated labels, `aria-describedby` for error messages, and an `aria-live="polite"` status region.
- The theme toggle communicates state through `aria-pressed` and an updated `aria-label`.

A formal conformance audit is out of scope — the points above describe implemented mechanisms.

### SEO

- All ten pages have their own `title`, `meta name="description"`, and `link rel="canonical"`.
- Every page includes a complete Open Graph metadata set (including image type and dimensions) and a Twitter Card of type `summary_large_image`.
- Every page includes two JSON-LD blocks: `LocalBusiness` and `WebSite`.
- `robots.txt` allows indexing of the whole site and points to `sitemap.xml`.
- `sitemap.xml` lists nine URLs — every page except `dziekujemy.html`.
- No page uses `meta name="robots"`, so indexing depends solely on `robots.txt` and search engine decisions.

### PWA and Offline Support

- `assets/favicon/site.webmanifest` defines `name`, `short_name`, `description`, `start_url` `/index.html`, `scope` `/`, `display` `standalone`, colors, and icons at 96, 180, 192, and 512 px.
- The manifest includes three shortcuts (Oferta, Realizacje, Kontakt) with dedicated icons, and two screenshots (wide 1440×900 and mobile 390×844).
- Pages declare `meta name="theme-color"`, updated together with the theme change.
- The repository contains no service worker and no service worker registration, so the site provides no offline caching.

### Performance

- The production build minifies CSS (`lightningcss`) and JavaScript (`esbuild`).
- Images are delivered through the `picture` element with AVIF and WebP variants and a JPG fallback; `srcset` and `sizes` are defined for every variant.
- Images carry explicit `width` and `height` attributes and `decoding="async"`; images below the first viewport use `loading="lazy"`.
- `scripts/optimize-images.mjs` writes JPG at `quality: 82` with `mozjpeg`, WebP at `quality: 80`, and AVIF at `quality: 50`, without enlarging source images.
- Fonts are hosted locally as WOFF2 subsets with `font-display: swap` and `unicode-range` splitting into `latin` and `latin-ext`.
- The runtime contains no external dependencies and no framework.

The repository contains no performance measurements, so the points above describe implemented mechanisms only.

### Data and State Persistence

- Page content is static and written directly into the HTML files. The project contains no backend, database, user accounts, or API communication.
- The site stores exactly two `localStorage` entries in the browser: `everafterring-theme` (selected theme) and `everafterringProjectNoticeAccepted` (modal dismissal). Both are documented in `cookies.html`.
- Theme persistence tolerates unavailable `localStorage` — the toggle then works for the current page only.
- Contact form data is not stored in the browser; its processing depends on Netlify Forms on the hosting side.

### Project Maintenance

- Page content is edited in the HTML files at the repository root.
- Changes to the header, navigation, footer, or project notice modal belong in `partials/header.html` and `partials/footer.html`, never in individual pages.
- A new page requires an entry in the `htmlPages` array in `scripts/build.mjs`; a page belonging to the primary navigation additionally requires entries in `primaryNavPages` and in `partials/header.html`, and public URLs are added to `sitemap.xml`.
- A new CSS file requires an import registered in `css/main.css`, and a new JS module requires a call in `js/app.js`.
- Selectors shared between modules are defined in `js/config.js`.
- New images are added to `assets/img-src/` and generated with `npm run optimize:images`; `assets/img/` holds generated files that are nevertheless version-controlled.
- The `dist/` directory is generated and excluded from the repository — it must not be edited manually.
- The `localStorage` keys are duplicated in `js/theme-bootstrap.js` and `js/modules/theme.js`; changing a key requires updating both files and the legal documents that describe it.

### License

The project is covered by the KP_Code proprietary project license (version 1.0) described in [LICENSE](LICENSE). It is not open-source software and not a dedication to the public domain; `package.json` declares `SEE LICENSE IN LICENSE`.

The license is bilingual, and the Polish version prevails in case of divergence. The rights owner is Kamil Król — KP_Code.

### Attributions

Third-party materials remain subject to their own licenses — the rules are stated in section 8 of [LICENSE](LICENSE). The repository hosts local subsets of the Cormorant Garamond and Inter fonts in `assets/fonts/`, declared in `css/fonts.css`.
