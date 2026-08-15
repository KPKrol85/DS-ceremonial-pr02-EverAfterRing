# EverAfter Ring

## PL

### Przegląd projektu

EverAfter Ring to statyczny, wielostronicowy serwis w języku polskim, zbudowany w HTML, CSS i Vanilla JavaScript, bez zależności runtime. Repozytorium zawiera dziesięć stron w katalogu głównym: stronę główną, ofertę, usługi, realizacje, stronę o zespole, formularz kontaktowy, potwierdzenie wysłania formularza oraz trzy dokumenty prawne.

Projekt jest realizacją referencyjną KP_Code Digital Studio przedstawiającą przykładowy serwis dla branży ślubnej. Charakter demonstracyjny jest zakomunikowany w samym interfejsie — modal „Informacja o projekcie” w `partials/footer.html` oraz strony prawne opisują serwis jako projekt portfolio, a nie działającą firmę.

Wspólny nagłówek i stopka są utrzymywane jako partiale i mają dwa tryby dostarczania: w trybie deweloperskim są pobierane przez `fetch`, a w buildzie produkcyjnym wstawiane bezpośrednio do plików HTML. Vite jest narzędziem developmentu, builda i podglądu — nie jest frameworkiem runtime — a wersja produkcyjna jest generowana do katalogu `dist/`.

### Wersja online

[https://ceremonial-pr02-everafterring.netlify.app/](https://ceremonial-pr02-everafterring.netlify.app/)

Ten adres jest zadeklarowany jako kanoniczny w metadanych wszystkich stron, w `robots.txt` oraz w `sitemap.xml`. Podczas przygotowania tego dokumentu adres zwracał stronę główną EverAfter Ring.

### Kluczowe funkcje

- Wielostronicowa struktura oparta na plikach HTML w katalogu głównym, bez routingu klienckiego.
- Wspólny `header` i `footer` z `partials/`, z automatycznym oznaczaniem aktywnej strony przez `aria-current="page"` — w trybie deweloperskim na podstawie `window.location`, a w buildzie produkcyjnym na podstawie nazwy pliku.
- Nawigacja mobilna poniżej progu 1024 px: `aria-expanded`, `aria-controls`, pułapka fokusa, zamykanie klawiszem `Escape`, kliknięciem linku i przy zmianie szerokości okna.
- Przełącznik motywu jasnego i ciemnego zapisywany w `localStorage` pod kluczem `everafterring-theme`, z synchronizacją między kartami przez zdarzenie `storage` i aktualizacją `meta[name="theme-color"]`.
- Osobny skrypt `js/theme-bootstrap.js` ładowany synchronicznie w `<head>` przed arkuszem stylów, ustawiający `data-theme` na `<html>`; przy braku zapisanego wyboru bierze pod uwagę `prefers-color-scheme`. W buildzie produkcyjnym jest minifikowany i wstawiany w to samo miejsce jako skrypt inline, żeby pozostał synchroniczny i wykonał się przed pierwszym malowaniem.
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
- `vite` `^8.2.1` — serwer deweloperski, build produkcyjny i podgląd builda
- `sharp` `^0.34.5` — generowanie wariantów obrazów
- `vite.config.js` — konfiguracja MPA oraz wtyczki builda specyficzne dla projektu
- własne skrypty `scripts/html-shell.mjs` i `scripts/optimize-images.mjs`

`vite` i `sharp` to jedyne bezpośrednie zależności projektu; obie są zależnościami deweloperskimi.

**Development i podgląd lokalny**

- serwer deweloperski Vite na porcie 8181 (`npm run dev`, uruchamiany też przez `start-local-preview.bat`)
- podgląd zbudowanego katalogu `dist/` na porcie 8182 (`npm run preview`)

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
- **Partiale** — `header` i `footer` to hosty z atrybutami `data-partial` i `data-partial-src`. W trybie deweloperskim `js/modules/partials.js` pobiera je przez `fetch` i oznacza aktywny link, a serwer Vite wydaje pliki z `partials/` w niezmienionej postaci, bez traktowania ich jak samodzielnych stron. W buildzie produkcyjnym `scripts/html-shell.mjs` zastępuje te hosty gotowym markupem i statycznie ustawia `aria-current="page"`. Oznacza to, że tryb deweloperski wymaga serwera HTTP.
- **CSS** — `css/main.css` jest jedynym punktem wejścia i importuje kolejno tokeny, fonty, bazę, layout, komponenty i sekcje. Wartości motywu są zdefiniowane jako właściwości custom w `css/tokens.css`, a wariant ciemny jako `:root[data-theme="dark"]`.
- **JavaScript** — `js/app.js` jest punktem wejścia i po `DOMContentLoaded` uruchamia moduły w ustalonej kolejności: partiale, motyw, nagłówek, nawigacja, formularz, hero, modal projektu. Wspólne selektory są w `js/config.js`, pomocnicze funkcje DOM i pułapka fokusa w `js/utils.js`, a logika interakcji w `js/modules/`.
- **Dwa punkty wejścia JS** — `js/app.js` jest modułem ES bundlowanym przez Vite, a `js/theme-bootstrap.js` pozostaje osobnym plikiem poza bundlem: w trybie deweloperskim jest ładowany jako klasyczny skrypt, a w buildzie minifikowany i wstawiany inline w to samo miejsce, ponieważ musi wykonać się synchronicznie przed renderowaniem stylów.
- **Obrazy** — pliki źródłowe znajdują się w `assets/img-src/`, a warianty generowane przez `scripts/optimize-images.mjs` w `assets/img/`. W markupie używany jest element `picture` z kolejnością AVIF, WebP i JPG.
- **Build** — `vite.config.js` deklaruje dziesięć wejść HTML (`appType: "mpa"`), wtyczkę wspólnego shellu opartą o `scripts/html-shell.mjs` oraz kopiowanie plików statycznych z pominięciem `assets/img-src/`. Build generuje katalog `dist/`, który jest wykluczony z repozytorium przez `.gitignore` i nie powinien być edytowany ręcznie.
- **Nazwy plików wynikowych** — bundlowany CSS i JavaScript trafiają do `dist/css/` i `dist/js/` z hashem treści w nazwie, natomiast pliki z `assets/` są kopiowane pod swoimi oryginalnymi ścieżkami, ponieważ odwołują się do nich `site.webmanifest`, bezwzględne adresy w metadanych i wygenerowane `srcset`.

### Struktura projektu

```text
.
├── assets/
│   ├── favicon/            # favicony, ikony PWA, zrzuty ekranu, site.webmanifest
│   ├── fonts/              # lokalne subsety WOFF2
│   ├── img/                # wygenerowane warianty obrazów (JPG, WebP, AVIF)
│   ├── img-src/            # źródłowe obrazy hero i portfolio
│   ├── logo/               # logo.svg używane w nagłówku i stopce
│   └── og-img/             # og-img.jpg używany w metadanych Open Graph i Twitter Card
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
│   ├── theme-bootstrap.js  # osobny skrypt (IIFE) wstawiany inline w buildzie
│   └── utils.js
├── partials/
│   ├── footer.html         # stopka i modal informacji o projekcie
│   └── header.html         # nagłówek, nawigacja, przełącznik motywu
├── scripts/
│   ├── html-shell.mjs      # wspólny shell, walidacja nawigacji, inline theme bootstrap
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
├── vite.config.js
├── AUDIT.md
├── CHANGELOG.md
├── LICENSE
└── PLAN.md
```

### Instalacja

Zależności są potrzebne do uruchomienia serwera deweloperskiego, builda produkcyjnego, podglądu builda i optymalizacji obrazów.

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
npm run dev
```

Podgląd jest dostępny pod adresem `http://localhost:8181/`. Serwer HTTP jest wymagany, ponieważ moduły ES i partiale pobierane przez `fetch` nie działają przy otwarciu plików przez `file://`.

W trybie deweloperskim strony są serwowane ze źródeł: partiale są pobierane przez `fetch`, a `js/theme-bootstrap.js` ładuje się jako osobny synchroniczny skrypt. Obie te rzeczy są rozwiązywane statycznie dopiero w buildzie produkcyjnym.

### Dostępne skrypty

| Skrypt | Działanie |
| --- | --- |
| `npm run dev` | Uruchamia serwer deweloperski Vite na porcie 8181. |
| `npm run build` | Buduje wersję produkcyjną do `dist/`. Nie generuje obrazów. |
| `npm run preview` | Serwuje zbudowany katalog `dist/` na porcie 8182. |
| `npm run optimize:images` | Generuje warianty obrazów z `assets/img-src/` do `assets/img/`. |

### Build produkcyjny

```bash
npm run build
```

Przebieg pełnego builda:

1. Wyczyszczenie katalogu `dist/`.
2. Transformacja dziesięciu stron HTML: wstawienie partiali, statyczne ustawienie `aria-current="page"` na aktywnym linku nawigacji głównej oraz zastąpienie tagu `js/theme-bootstrap.js` zminifikowanym skryptem inline.
3. Bundlowanie i minifikacja CSS oraz JavaScriptu do `dist/css/` i `dist/js/`, z hashem treści w nazwach plików.
4. Skopiowanie katalogu `assets/` bez `assets/img-src/` oraz plików `robots.txt` i `sitemap.xml` do `dist/`.

Transformacja HTML zawiera własne kontrole spójności i przerywa build błędem, gdy transformowany plik nie należy do listy `htmlPages`, gdy w pliku źródłowym brakuje hosta partiala lub tagu synchronicznego theme bootstrapu, albo gdy na stronie należącej do nawigacji głównej nie ma dokładnie jednego linku `nav__link` z `aria-current="page"`.

Generowanie obrazów nie jest częścią builda. `npm run build` nie modyfikuje wersjonowanych plików w `assets/img/` — warianty obrazów powstają wyłącznie po jawnym uruchomieniu `npm run optimize:images`.

Zbudowany katalog można sprawdzić lokalnie:

```bash
npm run preview
```

Podgląd serwuje `dist/` pod adresem `http://localhost:8182/`.

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
- Modal informacji o projekcie ma `role="dialog"`, `aria-modal="true"` oraz powiązany tytuł i opis (`aria-labelledby`, `aria-describedby`).
- Otwarty modal przenosi fokus na kontener dialogu (`tabindex="-1"`) i utrzymuje go w pułapce fokusa (`js/utils.js`); zamknięcie klawiszem `Escape`, przyciskiem akceptacji lub kliknięciem tła zwalnia pułapkę i przywraca fokus na wcześniej aktywny element, jeśli nadal istnieje poza modalem.
- `css/base.css` definiuje wspólny styl `:focus-visible` dla linków, przycisków i pól formularza.
- Redukcja ruchu jest obsługiwana zarówno w CSS (`css/base.css`, `css/components/nav.css`, `css/components/project-notice.css`), jak i w module hero, który nasłuchuje zmian `prefers-reduced-motion`.
- Formularz kontaktowy używa powiązanych etykiet, `aria-describedby` dla komunikatów błędów i regionu statusu `aria-live="polite"`.
- Przełącznik motywu komunikuje stan przez `aria-pressed` i aktualizowaną etykietę `aria-label`.

Zakres nie obejmuje formalnego audytu zgodności — powyższe punkty opisują zaimplementowane mechanizmy.

### SEO

- Wszystkie dziesięć stron ma własny `title`, `meta name="description"` i `link rel="canonical"`.
- Każda strona zawiera pełny zestaw metadanych Open Graph (wraz z wymiarami i typem obrazu) oraz Twitter Card `summary_large_image`.
- Każda strona zawiera dwa bloki JSON-LD: `WebPage` z adresem kanonicznym strony, powiązany przez `isPartOf` ze wspólnym blokiem `WebSite`, którego opis wskazuje demonstracyjny charakter projektu. Dane strukturalne nie deklarują działającego podmiotu gospodarczego ani danych kontaktowych.
- `robots.txt` zezwala na indeksowanie całego serwisu i wskazuje `sitemap.xml`.
- `sitemap.xml` zawiera dziewięć adresów — wszystkie strony poza `dziekujemy.html`.
- Żadna strona nie używa `meta name="robots"`, więc indeksowanie zależy wyłącznie od `robots.txt` i decyzji wyszukiwarki.

### PWA i obsługa offline

- `assets/favicon/site.webmanifest` definiuje `name`, `short_name`, `description`, `start_url` `/index.html`, `scope` `/`, `display` `standalone`, kolory oraz ikony 96, 180, 192 i 512 px.
- Manifest zawiera trzy skróty (Oferta, Realizacje, Kontakt) z własnymi ikonami oraz dwa zrzuty ekranu (wide 1440×900 i mobile 390×844).
- Strony deklarują `meta name="theme-color"` aktualizowany razem ze zmianą motywu.
- Repozytorium nie zawiera service workera ani rejestracji service workera, dlatego serwis nie udostępnia cache'owania offline.

### Wydajność

- Build produkcyjny (Vite) bundluje i minifikuje CSS oraz JavaScript, a pliki wynikowe otrzymują w nazwie hash treści. `js/theme-bootstrap.js` jest minifikowany i wstawiany inline, więc nie wymaga osobnego żądania przed pierwszym malowaniem.
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
- Nowa strona wymaga dodania wpisu w tablicy `htmlPages` w `scripts/html-shell.mjs` — ta sama lista definiuje wejścia MPA w `vite.config.js` — a strona należąca do nawigacji głównej dodatkowo w `primaryNavPages` oraz w `partials/header.html`; adresy publiczne dodaje się do `sitemap.xml`.
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

The shared header and footer are maintained as partials with two delivery modes: they are fetched at runtime in development and inlined into the HTML files during the production build. Vite is the development, build, and preview tool — not a runtime framework — and the production version is generated into `dist/`.

### Live Version

[https://ceremonial-pr02-everafterring.netlify.app/](https://ceremonial-pr02-everafterring.netlify.app/)

This address is declared as canonical in the metadata of every page, in `robots.txt`, and in `sitemap.xml`. While this document was prepared, the address returned the EverAfter Ring home page.

### Key Features

- Multi-page structure based on top-level HTML files, without client-side routing.
- Shared `header` and `footer` from `partials/`, with the active page marked by `aria-current="page"` — derived from `window.location` in development and from the file name during the production build.
- Mobile navigation below the 1024 px threshold: `aria-expanded`, `aria-controls`, focus trap, and closing via `Escape`, a link click, or a window resize.
- Light/dark theme toggle persisted in `localStorage` under the `everafterring-theme` key, synchronized across tabs through the `storage` event and reflected in `meta[name="theme-color"]`.
- A separate `js/theme-bootstrap.js` script loaded synchronously in `<head>` before the stylesheet, setting `data-theme` on `<html>`; with no stored choice it falls back to `prefers-color-scheme`. The production build minifies it and inlines it in the same position, so it stays synchronous and runs before the first paint.
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
- `vite` `^8.2.1` — development server, production build, and build preview
- `sharp` `^0.34.5` — image variant generation
- `vite.config.js` — MPA configuration and the project-specific build plugins
- custom scripts in `scripts/html-shell.mjs` and `scripts/optimize-images.mjs`

`vite` and `sharp` are the project's only direct dependencies; both are development dependencies.

**Local development and preview**

- Vite development server on port 8181 (`npm run dev`, also started through `start-local-preview.bat`)
- preview of the built `dist/` directory on port 8182 (`npm run preview`)

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
- **Partials** — `header` and `footer` are host elements carrying `data-partial` and `data-partial-src`. In development, `js/modules/partials.js` fetches them and marks the active link, and the Vite server serves the files under `partials/` verbatim instead of treating them as standalone entries. In the production build, `scripts/html-shell.mjs` replaces those hosts with the resolved markup and sets `aria-current="page"` statically. Development therefore requires an HTTP server.
- **CSS** — `css/main.css` is the single entry point and imports tokens, fonts, base, layout, components, and sections in order. Theme values are defined as custom properties in `css/tokens.css`, with the dark variant under `:root[data-theme="dark"]`.
- **JavaScript** — `js/app.js` is the entry point and, after `DOMContentLoaded`, runs the modules in a fixed order: partials, theme, header, navigation, form, hero, project notice. Shared selectors live in `js/config.js`, DOM helpers and the focus trap in `js/utils.js`, and interaction logic in `js/modules/`.
- **Two JS entry points** — `js/app.js` is an ES module bundled by Vite, while `js/theme-bootstrap.js` stays a separate file outside the bundle: development loads it as a classic script, and the build minifies it and inlines it in the same position, because it must run synchronously before styles render.
- **Images** — source files live in `assets/img-src/`, and the variants generated by `scripts/optimize-images.mjs` in `assets/img/`. The markup uses the `picture` element with AVIF, WebP, and JPG in that order.
- **Build** — `vite.config.js` declares the ten HTML entries (`appType: "mpa"`), the shared-shell plugin backed by `scripts/html-shell.mjs`, and the static asset copy that excludes `assets/img-src/`. The build generates the `dist/` directory, which is excluded from the repository by `.gitignore` and should not be edited manually.
- **Output file names** — bundled CSS and JavaScript land in `dist/css/` and `dist/js/` with a content hash in the file name, while files under `assets/` are copied at their authored paths, because `site.webmanifest`, the absolute URLs in the metadata, and the generated `srcset` values all reference them there.

### Project Structure

```text
.
├── assets/
│   ├── favicon/            # favicons, PWA icons, screenshots, site.webmanifest
│   ├── fonts/              # local WOFF2 subsets
│   ├── img/                # generated image variants (JPG, WebP, AVIF)
│   ├── img-src/            # hero and portfolio image sources
│   ├── logo/               # logo.svg used in the header and the footer
│   └── og-img/             # og-img.jpg used in the Open Graph and Twitter Card metadata
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
│   ├── theme-bootstrap.js  # separate script (IIFE) inlined by the build
│   └── utils.js
├── partials/
│   ├── footer.html         # footer and project notice modal
│   └── header.html         # header, navigation, theme toggle
├── scripts/
│   ├── html-shell.mjs      # shared shell, navigation validation, theme bootstrap inlining
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
├── vite.config.js
├── AUDIT.md
├── CHANGELOG.md
├── LICENSE
└── PLAN.md
```

### Installation

Dependencies are required to run the development server, the production build, the build preview, and image optimization.

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
npm run dev
```

The preview is available at `http://localhost:8181/`. An HTTP server is required because ES modules and partials fetched at runtime do not work when files are opened over `file://`.

In development the pages are served from source: the partials are fetched at runtime and `js/theme-bootstrap.js` loads as a separate synchronous script. Both are resolved statically only in the production build.

### Available Scripts

| Script | Behavior |
| --- | --- |
| `npm run dev` | Starts the Vite development server on port 8181. |
| `npm run build` | Builds the production version into `dist/`. Does not generate images. |
| `npm run preview` | Serves the built `dist/` directory on port 8182. |
| `npm run optimize:images` | Generates image variants from `assets/img-src/` into `assets/img/`. |

### Production Build

```bash
npm run build
```

Full build sequence:

1. Emptying the `dist/` directory.
2. Transforming the ten HTML pages: inlining the partials, setting `aria-current="page"` statically on the active primary-navigation link, and replacing the `js/theme-bootstrap.js` tag with a minified inline script.
3. Bundling and minifying CSS and JavaScript into `dist/css/` and `dist/js/`, with a content hash in the file names.
4. Copying the `assets/` directory without `assets/img-src/`, plus `robots.txt` and `sitemap.xml`, into `dist/`.

The HTML transformation includes its own consistency checks and fails the build when a transformed file is not part of the `htmlPages` list, when a partial host or the synchronous theme bootstrap tag is missing from a source file, or when a page belonging to the primary navigation does not contain exactly one `nav__link` with `aria-current="page"`.

Image generation is not part of the build. `npm run build` does not modify version-controlled files in `assets/img/` — image variants are produced only by explicitly running `npm run optimize:images`.

The built directory can be checked locally:

```bash
npm run preview
```

The preview serves `dist/` at `http://localhost:8182/`.

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
- The project notice modal uses `role="dialog"`, `aria-modal="true"`, and an associated title and description (`aria-labelledby`, `aria-describedby`).
- The open modal moves focus to the dialog container (`tabindex="-1"`) and keeps it in a focus trap (`js/utils.js`); closing via `Escape`, the accept button, or a backdrop click releases the trap and restores focus to the previously focused element when it still exists outside the modal.
- `css/base.css` defines a shared `:focus-visible` style for links, buttons, and form fields.
- Reduced motion is handled both in CSS (`css/base.css`, `css/components/nav.css`, `css/components/project-notice.css`) and in the hero module, which listens for `prefers-reduced-motion` changes.
- The contact form uses associated labels, `aria-describedby` for error messages, and an `aria-live="polite"` status region.
- The theme toggle communicates state through `aria-pressed` and an updated `aria-label`.

A formal conformance audit is out of scope — the points above describe implemented mechanisms.

### SEO

- All ten pages have their own `title`, `meta name="description"`, and `link rel="canonical"`.
- Every page includes a complete Open Graph metadata set (including image type and dimensions) and a Twitter Card of type `summary_large_image`.
- Every page includes two JSON-LD blocks: a `WebPage` carrying the page's canonical URL, linked through `isPartOf` to the shared `WebSite` block whose description states the project's demonstration character. The structured data declares no operating business and no contact details.
- `robots.txt` allows indexing of the whole site and points to `sitemap.xml`.
- `sitemap.xml` lists nine URLs — every page except `dziekujemy.html`.
- No page uses `meta name="robots"`, so indexing depends solely on `robots.txt` and search engine decisions.

### PWA and Offline Support

- `assets/favicon/site.webmanifest` defines `name`, `short_name`, `description`, `start_url` `/index.html`, `scope` `/`, `display` `standalone`, colors, and icons at 96, 180, 192, and 512 px.
- The manifest includes three shortcuts (Oferta, Realizacje, Kontakt) with dedicated icons, and two screenshots (wide 1440×900 and mobile 390×844).
- Pages declare `meta name="theme-color"`, updated together with the theme change.
- The repository contains no service worker and no service worker registration, so the site provides no offline caching.

### Performance

- The production build (Vite) bundles and minifies CSS and JavaScript, and the emitted files carry a content hash in their names. `js/theme-bootstrap.js` is minified and inlined, so it costs no separate request before the first paint.
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
- A new page requires an entry in the `htmlPages` array in `scripts/html-shell.mjs` — the same list defines the MPA entries in `vite.config.js`; a page belonging to the primary navigation additionally requires entries in `primaryNavPages` and in `partials/header.html`, and public URLs are added to `sitemap.xml`.
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
