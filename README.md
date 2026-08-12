# EverAfter Ring

## PL

### Przegląd projektu
EverAfter Ring to statyczny, wielostronicowy serwis referencyjny zbudowany w HTML, CSS i Vanilla JavaScript. Repozytorium zawiera strony oferty, usług, realizacji, informacji o zespole, kontaktu, potwierdzenia formularza oraz dokumenty prawne. Wspólne elementy nagłówka i stopki są utrzymywane jako partiale, a produkcyjna wersja strony jest generowana przez własny pipeline builda do katalogu `dist/`.

### Kluczowe funkcje
- Wielostronicowa struktura oparta na plikach HTML w katalogu głównym.
- Wspólny `header` i `footer` ładowane z `partials/` w trybie źródłowym oraz osadzane bezpośrednio podczas builda.
- Responsywna nawigacja z menu mobilnym, obsługą klawisza `Escape`, zarządzaniem fokusem i stanem aktywnej strony przez `aria-current`.
- Przełącznik motywu jasnego i ciemnego z zapisem wyboru w `localStorage` oraz wczesnym skryptem inicjalizującym motyw.
- Formularz kontaktowy z walidacją po stronie klienta, komunikatami błędów i regionem statusu `aria-live`.
- Modal informacyjny projektu z zapisem akceptacji w `localStorage`.
- Ruch obrazu w sekcji hero z uwzględnieniem preferencji `prefers-reduced-motion`.

### Stack technologiczny
**Runtime**
- HTML5
- CSS
- Vanilla JavaScript jako ES modules

**Build tooling**
- Node.js i npm
- `esbuild`
- `lightningcss`
- `sharp`
- własne skrypty `scripts/build.mjs` i `scripts/optimize-images.mjs`

**Assety i metadane**
- JPG, WebP, AVIF, SVG
- lokalne fonty WOFF2
- `robots.txt`
- `sitemap.xml`
- JSON-LD
- web app manifest

### Struktura projektu
```text
.
├── assets/                 # obrazy, fonty, favicony, manifest i źródła obrazów
├── css/                    # tokeny, baza, layout, komponenty i style sekcji
├── js/                     # punkt wejścia, konfiguracja, utils i moduły UI
├── partials/               # wspólny nagłówek i stopka
├── scripts/                # build produkcyjny i optymalizacja obrazów
├── index.html              # strona główna
├── oferta.html             # oferta
├── uslugi.html             # usługi
├── realizacje.html         # realizacje
├── o-nas.html              # o nas
├── kontakt.html            # formularz kontaktowy
├── dziekujemy.html         # potwierdzenie formularza
├── polityka-prywatnosci.html
├── regulamin.html
├── cookies.html
├── package.json
├── robots.txt
├── sitemap.xml
└── start-local-preview.bat
```

### Instalacja i konfiguracja
Repozytorium zawiera zależności developerskie wymagane przez pipeline builda.

```bash
npm install
```

### Development lokalny
Lokalny podgląd można uruchomić skryptem wsadowym:

```bat
start-local-preview.bat
```

Skrypt startuje serwer:

```bash
python -m http.server 8181
```

Podgląd jest dostępny pod adresem `http://localhost:8181/`.

### Build produkcyjny
Pełny build produkcyjny:

```bash
npm run build
```

Dostępne skrypty cząstkowe:

```bash
npm run clean
npm run optimize:images
npm run build:css
npm run build:js
npm run build:html
npm run build:assets
```

Pipeline:
- generuje warianty obrazów z `assets/img-src/` do `assets/img/`,
- bundluje i minifikuje CSS do `dist/css/main.min.css`,
- bundluje i minifikuje JavaScript do `dist/js/app.min.js` oraz `dist/js/theme-bootstrap.min.js`,
- osadza partiale w finalnych plikach HTML,
- podmienia odwołania do źródłowych plików CSS i JavaScript na pliki produkcyjne,
- kopiuje assety, `robots.txt` i `sitemap.xml` do `dist/`.

### Dostępność
- Strony zawierają link pomijający prowadzący do `#main`.
- Layout korzysta z semantycznych elementów `header`, `nav`, `main` i `footer`.
- Nawigacja mobilna używa `aria-expanded`, `aria-controls` i `aria-current`.
- Otwarty panel nawigacji mobilnej zarządza fokusem klawiatury.
- Style bazowe definiują widoczny stan `:focus-visible`.
- CSS i moduł hero uwzględniają `prefers-reduced-motion`.
- Formularz kontaktowy wykorzystuje powiązane etykiety, `aria-describedby` i status `aria-live="polite"`.

### SEO
- Strony zawierają indywidualne tytuły, opisy meta i adresy kanoniczne.
- Dokumenty zawierają metadane Open Graph i Twitter Card.
- Repozytorium zawiera `robots.txt` i `sitemap.xml`.
- W HTML osadzono dane strukturalne JSON-LD.
- Projekt zawiera favicony i web app manifest.

### Wydajność
- Build produkcyjny minifikuje CSS i JavaScript.
- Skrypt optymalizacji obrazów generuje warianty JPG, WebP i AVIF w kilku szerokościach.
- Obrazy w markupie używają `srcset`, `sizes`, jawnych wymiarów i `decoding="async"`.
- Wybrane obrazy portfolio są ładowane przez `loading="lazy"`.
- Fonty są serwowane lokalnie w formacie WOFF2.

### Utrzymanie projektu
- Główna treść stron znajduje się w plikach HTML w katalogu głównym.
- Wspólne fragmenty layoutu są w `partials/header.html` i `partials/footer.html`.
- Style są organizowane przez `css/main.css`, który importuje tokeny, bazę, layout, komponenty i sekcje.
- Interakcje są rozdzielone na moduły w `js/modules/`.
- Selektory współdzielone przez JS są zdefiniowane w `js/config.js`.
- Proces produkcyjny jest skupiony w `scripts/build.mjs`, a optymalizacja obrazów w `scripts/optimize-images.mjs`.

### Licencja
Repozytorium ma deklarację `UNLICENSED` w `package.json`.

## EN

### Project Overview
EverAfter Ring is a static multi-page reference website built with HTML, CSS, and Vanilla JavaScript. The repository contains offer, services, portfolio, about, contact, form confirmation, and legal pages. Shared header and footer elements are maintained as partials, and the production version is generated by a custom build pipeline into `dist/`.

### Key Features
- Multi-page structure based on top-level HTML files.
- Shared `header` and `footer` loaded from `partials/` in source mode and embedded directly during the build.
- Responsive navigation with a mobile menu, `Escape` handling, focus management, and active-page state through `aria-current`.
- Light/dark theme toggle with `localStorage` persistence and an early theme bootstrap script.
- Contact form with client-side validation, field-level error messages, and an `aria-live` status region.
- Project notice modal with acceptance stored in `localStorage`.
- Hero image motion behavior that respects `prefers-reduced-motion`.

### Tech Stack
**Runtime**
- HTML5
- CSS
- Vanilla JavaScript as ES modules

**Build tooling**
- Node.js and npm
- `esbuild`
- `lightningcss`
- `sharp`
- custom scripts in `scripts/build.mjs` and `scripts/optimize-images.mjs`

**Assets and metadata**
- JPG, WebP, AVIF, SVG
- local WOFF2 fonts
- `robots.txt`
- `sitemap.xml`
- JSON-LD
- web app manifest

### Project Structure
```text
.
├── assets/                 # images, fonts, favicons, manifest, and image sources
├── css/                    # tokens, base, layout, components, and section styles
├── js/                     # entry point, config, utils, and UI modules
├── partials/               # shared header and footer
├── scripts/                # production build and image optimization
├── index.html              # home page
├── oferta.html             # offer
├── uslugi.html             # services
├── realizacje.html         # portfolio
├── o-nas.html              # about
├── kontakt.html            # contact form
├── dziekujemy.html         # form confirmation
├── polityka-prywatnosci.html
├── regulamin.html
├── cookies.html
├── package.json
├── robots.txt
├── sitemap.xml
└── start-local-preview.bat
```

### Setup and Installation
The repository includes development dependencies required by the build pipeline.

```bash
npm install
```

### Local Development
Local preview can be started with the batch script:

```bat
start-local-preview.bat
```

The script starts:

```bash
python -m http.server 8181
```

The preview is available at `http://localhost:8181/`.

### Production Build
Full production build:

```bash
npm run build
```

Available partial scripts:

```bash
npm run clean
npm run optimize:images
npm run build:css
npm run build:js
npm run build:html
npm run build:assets
```

The pipeline:
- generates image variants from `assets/img-src/` into `assets/img/`,
- bundles and minifies CSS into `dist/css/main.min.css`,
- bundles and minifies JavaScript into `dist/js/app.min.js` and `dist/js/theme-bootstrap.min.js`,
- embeds partials into final HTML files,
- switches source CSS and JavaScript references to production files,
- copies assets, `robots.txt`, and `sitemap.xml` into `dist/`.

### Accessibility
- Pages include a skip link targeting `#main`.
- The layout uses semantic `header`, `nav`, `main`, and `footer` elements.
- Mobile navigation uses `aria-expanded`, `aria-controls`, and `aria-current`.
- The open mobile navigation panel manages keyboard focus.
- Base styles define a visible `:focus-visible` state.
- CSS and the hero module account for `prefers-reduced-motion`.
- The contact form uses associated labels, `aria-describedby`, and an `aria-live="polite"` status region.

### SEO
- Pages include individual titles, meta descriptions, and canonical URLs.
- Documents include Open Graph and Twitter Card metadata.
- The repository includes `robots.txt` and `sitemap.xml`.
- JSON-LD structured data is embedded in the HTML.
- The project includes favicons and a web app manifest.

### Performance
- The production build minifies CSS and JavaScript.
- The image optimization script generates JPG, WebP, and AVIF variants at multiple widths.
- Images in markup use `srcset`, `sizes`, explicit dimensions, and `decoding="async"`.
- Selected portfolio images use `loading="lazy"`.
- Fonts are served locally in WOFF2 format.

### Project Maintenance
- Main page content lives in top-level HTML files.
- Shared layout fragments are in `partials/header.html` and `partials/footer.html`.
- Styles are organized through `css/main.css`, which imports tokens, base, layout, components, and sections.
- Interactions are split into modules in `js/modules/`.
- Selectors shared by JavaScript are defined in `js/config.js`.
- The production process is concentrated in `scripts/build.mjs`, with image optimization in `scripts/optimize-images.mjs`.

### License
The repository declares `UNLICENSED` in `package.json`.
