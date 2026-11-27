# EverAfterRing — Design Improvements

**Analysis date:** 2026-11-22

**Project type:** Polish-language wedding-planning and ceremony-services demo by KP_Code Digital Studio. Static multi-page HTML, CSS and vanilla JavaScript, served and built with Vite.

**Status:** Proposed — awaiting owner review; no implementation authorized

**Analysis mode:** Evidence-based creative design review

**Focus:** Project-wide design

## 1. Methodology and evidence

- **Source** — Inspected the eleven HTML entries, shared header and footer, CSS entry point, tokens, local font declarations, layout and relevant component styles. Reviewed the hero, theme, navigation, project notice and lightbox modules, the image pipeline and the portfolio assets. [Page registration](scripts/html-shell.mjs) · [CSS entry point](css/main.css) · [Image pipeline](scripts/optimize-images.mjs)
- **Runtime and Visual** — Inspected local Vite renders directly using temporary browser captures. Reviewed home, offer, services, portfolio, about, contact, supporting pages and sampled overlays. Recorded selected geometry, loaded fonts and interaction behavior separately from visual interpretation. Section 9 specifies the coverage.
- **Historical** — Reviewed the project overview, architecture, attributions and verification guidance, plus the changelog, completed plan, technical audit and UI, UX, technical, quality and workflow improvement records. The checkout had no active root plan or existing design report. Prior spacing, price alignment, stationary cards, legal reading layout, portfolio instructions and closing destinations informed the baseline. [README](README.md) · [Changelog](docs/CHANGELOG.md) · [Archived plan](docs/archive/plans/PLAN-2026-08-15.md) · [Archived audit](docs/archive/audits/AUDIT-2026-08-15.md) · [Improvement records](docs/archive/improvements/)
- **Design judgment** identifies professional interpretation and future design intent. The review used a single desktop browser engine and the current project assets. No audience research, analytics or asset-specific permissions were available for this assessment.

## 2. Executive design assessment

The site presents a fictional boutique wedding-planning agency with a warm palette, fine serif headlines and ceremony imagery. The home rings photograph, the amber-toned dark edition and the separation between display type and practical copy already establish the right atmosphere. On the offer page the three package cards provide a clear comparison, and the lightbox gives photography more room with the title and caption still in view. The project notice and contact disclosure establish the portfolio context. [Home](index.html) · [Offer](oferta.html) · [Portfolio](realizacje.html) · [Contact](kontakt.html) · [Shared footer](partials/footer.html)

**Design judgment.** The project is most distinctive where it shows the relationship between a ceremony detail and the planning behind it. That relationship is hard to see in the current sequence. Framed hero images introduce almost every primary route with similar weight, and subsequent panels give reassurance, service information and photography a similar rhythm. The next design phase should make the home opening recognisable through its rings photograph and typography, give planning its own editorial structure, and let a selected portfolio image carry the transition from preparation to ceremony.

## 3. Current design identity

### Typography, colour and surfaces

**Source and Runtime.** Cormorant Garamond serves headings and Inter serves body and utility text. Both families loaded from local Latin and Latin Extended faces in the sampled runs. The hero heading computed to 49.6 px at 1440 px and 35.2 px at 820 and 390 px. **Visual.** Fine serif headings, ivory and champagne backgrounds, rosewood actions and the gold mark evoke wedding stationery. In dark mode, ink-brown surfaces and champagne accents retain the warmth and make bright photographs stand out. **Design judgment.** The type pairing and both colour editions have enough character to carry a clearer hierarchy. Use flat page surfaces for reading, fine rules for sequence and a distinct elevation layer for genuine overlays. [Fonts](css/fonts.css) · [Base styles](css/base.css) · [Tokens](css/tokens.css)

### Opening, responsive composition and imagery

**Source and Runtime.** The six main pages use a common framed hero and responsive image variants. On the home page the layout switches from one to two columns at 900 px, while primary navigation changes at 1024 px. At 1440 × 900 the home image frame was approximately 473 × 326 px. At 820 × 1180 the stacked frame was 788 × 534 px. At 390 × 844 it began around 650 px down and extended beyond the first viewport. **Visual.** The two rings make a legible focal point, but the mobile badge, heading, action row and metadata occupy most of the opening screen. Tablet gives the frame more visual weight than desktop. The single portrait frame on contact uses the same visual ceremony as the home opening and separates its introduction from the form. **Design judgment.** The home deserves a recognisable cover composition, while contact needs a quieter functional lead-in. [Home hero](index.html#L79) · [Contact hero and form](kontakt.html#L80) · [Hero styles](css/sections/hero.css) · [Navigation styles](css/components/nav.css)

### Editorial rhythm and portfolio

**Source and Visual.** The homepage moves through benefits, service summaries, packages, five steps, testimonials and a three-image preview. Its benefits use four columns at the sampled desktop width with two items on the next row. The process uses five full-width raised blocks on desktop and five stacked blocks on mobile. Services repeat a two-panel composition and process chips across five anchored topics. On the portfolio page, nine equal cards occupy a 4–4–1 arrangement at 1440 px and a single column at 390 px. Their 4:3 images depict ceremony settings at different scales, including the aisle in Garden Elegance and the reception room in Royal Classic. The standalone photo of a couple in the portfolio hero is separate from those nine scenes. **Design judgment.** Equal presentation is appropriate for package comparison. Planning needs a stronger sense of sequence and portfolio needs a deliberate opening image followed by a quieter index. [Home sections](index.html#L120) · [Services](uslugi.html#L112) · [Portfolio grid](realizacje.html#L113) · [Layout styles](css/layout.css) · [Card styles](css/components/cards.css)

### Closing, overlays and supporting pages

**Source and Visual.** Four primary pages close with a tinted callout and the same dark footer. On mobile, the footer stacks brand, navigation, author contact and social links before the legal line. The two actions precede these groups. In the sampled dark homepage and portfolio, the brighter gold fill goes to the package link while the earlier contact link uses a darker surface. The project notice and the lightbox each establish a clear foreground over a dimmed backdrop. The legal pages use text-only openings and dedicated prose styles. The confirmation and 404 pages reuse the home rings image. **Design judgment.** Keep the clarity of the two overlays and the quiet utility of legal and recovery views. Give the closing chapter a stable action hierarchy and a restrained transition to the author information and legal links. [Callouts](css/sections/callout.css) · [Button variants](css/components/buttons.css) · [Footer](partials/footer.html) · [Legal styles](css/components/legal.css) · [Confirmation](dziekujemy.html) · [404](404.html)

### Motion

**Source and Runtime.** The hero uses entrance animations and pointer-driven image movement. The reduced-motion preference cleared the inline hero transform and reduced the computed entrance animation duration on the sampled home page. The lightbox and notice also have preference-aware transition rules. **Design judgment.** The next direction can establish movement through composition and sequencing. Keep interface transitions brief and use the existing reduced-motion contract for any affected treatment. [Hero module](js/modules/hero.js) · [Base motion rules](css/base.css#L107) · [Lightbox styles](css/components/lightbox.css) · [Notice styles](css/components/project-notice.css)

## 4. Design prerequisites

| Prerequisite | Evidence | Follow-up boundary |
| --- | --- | --- |
| Confirm which images represent Vineyard Glow and Modern Glam before approving the gallery sequence. | **Source and Visual.** The entries have different names and descriptions. Their separate URLs deliver byte-identical images at all three widths in AVIF, WebP and JPG. Both source JPEGs also produce the same 24 × 24 RGB sample after decoding. [Vineyard Glow](realizacje.html#L226) · [Modern Glam](realizacje.html#L325) · [Source imagery](assets/img-src/portfolio-img/) | Owner confirms the intended pairing or how the shared photograph should be presented. Caption, source asset and variant corrections are separate work. |
| Approve the provenance and presentation of any image or testimonial that would gain editorial prominence. | **Source.** The terms identify the brand as fictional and its offer content as exemplary. The homepage introduces the testimonials as “Prawdziwe historie,” and the portfolio describes styles as completed work. The repository's general third-party clause does not establish item-level permission for a new use. [Home testimonials](index.html#L251) · [Portfolio introduction](realizacje.html#L113) · [Project terms](regulamin.html#L133) · [License](LICENSE.md) | Owner confirms which images can be reused or recropped, whether gallery entries should be described as representative concepts, and the status of quotations before they receive added emphasis. Plan layouts with current assets where appropriate. Reserve final approval for confirmed material. |

## 5. Creative design directions

Both directions build on the existing fonts, warm dual-theme palette and image pipeline. They differ in what drives the sequence.

| Dimension | Ceremony and planning editorial | Wedding ceremony lookbook |
| --- | --- | --- |
| Organising idea | Follow the relationship between a ceremony detail and the decisions behind it. | Group imagery by atmosphere, using landscape, reception rooms and close detail as the page sequence. |
| Typography and material | Cormorant for opening and chapter titles, Inter for planning information and controls. Ivory or warm ink with fine rules and restrained accent fills. | Short serif introductions, compact sans captions and a quiet surface behind larger photographs. |
| Composition and photography | Use the rings as the home cover, flatter sections for planning and a featured scene in the gallery. Treat the contact portrait as supporting imagery. | Use a sequence of large ceremony views and smaller details. Match focal points and visual temperature across the chosen set. |
| Mobile and motion | Keep existing actions adjacent to their copy. Give the image a deliberate mobile crop and use a single-column planning sequence. | Build a vertical image and caption sequence with deliberate pacing. Both directions can use static composition with the existing preference-aware state transitions. |
| Trade-off and technical fit | Works through local section variants in the current CSS and HTML. Needs careful decisions about where to retain a card and where to use a rule. | Fits responsive pictures and the existing lightbox. Depends more heavily on a cleared, differentiated photo set and may give the service and offer pages less visual continuity. |

## 6. Recommended direction

Choose **Ceremony and planning editorial**. The demo can express both wedding atmosphere and the care behind a well-planned day using material it already contains. The home rings, warm light and dark surfaces, serif/sans pairing, aligned package comparisons and direct captioned lightbox give the direction a credible foundation. Reserve the strongest photographic emphasis for the home and portfolio. Make the process visibly sequential and give the contact introduction a quieter role.

**Guiding hierarchy** — ceremony detail → purpose and next action → planning sequence and offer → selected scenes → closing invitation and author credit.

Use a shared display/caption relationship, a fine rule for editorial separation and one dominant action per callout. Carry those roles across both theme editions. Deliver local HTML and CSS changes through the existing Vite entry points and shared partials, preserving Polish content, semantic order, navigation and form contracts, theme selection, accessible controls, metadata and current asset delivery. [Architecture](README.md#architecture) · [Theme tokens](css/tokens.css) · [Shared shell](scripts/html-shell.mjs)

## 7. Prioritized design improvements

P1 establishes the direction or shapes a principal page. P2 extends that direction into supporting compositions. Each proposal awaits approval, and its acceptance criteria describe future verification.

### IMP-DESIGN-01 — Make the rings photograph the home cover

- **Status:** COMPLETED — implemented and verified.
- **Result:** Home uses an opt-in `hero--cover` variant with an arched rings photograph, a fine inner frame line, a single reveal entrance, larger hero actions, a quieter metadata line and an accurate image description. Contact uses a compact `hero--compact` variant with a smaller supporting portrait; other pages keep the shared hero.
- **Verification:** Playwright renders at 1440, 1024/1023, 900/899, 820, 390 and 320 px in both themes kept both pages free of horizontal overflow, with the primary action and rings visible within 390 × 844 and the contact form heading in the viewport where the image ends. Reduced motion, focus, pointer parallax, responsive sources and baseline-identical `o-nas.html` hero geometry were confirmed; `npm run check`, `git diff --check`, the build and the page-load, theme and navigation specs passed. The crop uses existing assets through CSS only, with no new image files.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-02 — Give the planning process an editorial sequence

- **Status:** Proposed
- **Priority:** P1
- **Affected area:** Home benefits and “Jak pracujemy,” plus the anchored service chapters.
- **Evidence:** **Source and Visual** — Six home benefits, five stacked numbered steps and five pairs of service panels rely on repeated rounded surfaces. Services also document ordered activities within each topic. **Historical** — Responsive section padding and package price alignment were already delivered. [Benefits](index.html#L120) · [Home process](index.html#L219) · [Services](uslugi.html#L112) · [Process CSS](css/sections/process.css) · [Completed UI work](docs/archive/improvements/IMPROVEMENTS-UI-2026-11-17.md)
- **Current state:** Benefits appear as individual cards. Each home step occupies an elevated block. Each service chapter uses two cards, followed within each card by a labelled group of process chips.
- **Design judgment:** The existing numbered content can communicate progression more directly. The benefits and service chapters can read as parts of the same planning guide with fewer independent surfaces.
- **Proposed improvement:** Present benefits as a flat grouped introduction. Give “Jak pracujemy” one numbered sequence with a shared rule and consistent number/title alignment. On services, keep the existing topics and paired explanations, with chapter headings, aligned text starts and lighter internal sequence styling. Reserve boxed comparison treatments for the packages.
- **Expected value:** Gives preparation a recognisable composition and creates variation between explanatory content and comparison.
- **Implementation scope:** Deliver home benefits and process first, then carry the pattern into selected service chapters and extend after review. Use local layouts and existing typography and tokens. Keep heading order, all five service anchors, existing service copy and links, package layout and the testimonial block.
- **Dependencies:** Direction approval and agreement on the shared type and material roles. The layout can proceed alongside the home cover and uses existing content.
- **Acceptance criteria:** Across desktop, tablet and mobile in both themes, all six benefits, five home steps and five service topics are visible in their original reading order. A continuous numbering and alignment pattern joins the steps, with no need for horizontal scrolling. Service fragment links land on their visible headings beneath the persistent header. Check Polish wrapping, 200% zoom, focus on existing links and contrast of any rule or labels used to communicate sequence.
- **Impact:** High
- **Effort:** Large

### IMP-DESIGN-03 — Open the portfolio with a featured scene

- **Status:** Proposed
- **Priority:** P1
- **Affected area:** Portfolio introduction and “Wybrane historie” gallery.
- **Evidence:** **Source and Visual** — The standalone couple photograph precedes nine equally framed cards. At 1440 px the ninth card stands alone in the third row. At 390 px the cards repeat in one column. The existing lightbox already presents a photograph with its own title and description. [Portfolio](realizacje.html#L81) · [Cards](css/components/cards.css) · [Lightbox module](js/modules/lightbox.js)
- **Current state:** All nine gallery entries use the same 4:3 image frame, title, description and tags. Each image control opens the shared lightbox.
- **Design judgment:** The current composition supports browsing. A selected scene could establish a focal point and give the remaining images a more deliberate cadence.
- **Proposed improvement:** Give the first approved scene a larger presentation with its caption visibly adjacent, followed by an ordered index of the other eight. Use Royal Classic as an initial layout candidate because its room view holds detail at larger scale and it is already first in the DOM. Let the introductory couple image act as a preface. Keep the home preview as the short selection that leads to the full gallery.
- **Expected value:** Creates an editorial opening, gives the nine scenes a readable visual sequence and preserves the lightbox as the point of closer inspection.
- **Implementation scope:** Review the lead layout and gallery index first, then integrate approved images and captions in the page's HTML and scoped styles. Retain the nine entries, their named image controls, the gesture hint, image alternatives, responsive picture sources, native dialog and focus return. If the owner selects a different lead, make its visible and DOM positions agree.
- **Dependencies:** Confirm the intended Vineyard Glow and Modern Glam pairing, the provenance and suitable crops for images used at greater scale, and the gallery's editorial framing.
- **Acceptance criteria:** At 1440, 820 and 390 px in both themes, there is one larger lead with a legible adjacent caption and eight regular entries. Narrow screens preserve a single ordered stream, with the subject clear inside the lead crop. All nine controls are reachable and open the correct enlarged image and caption by their supported keyboard, mouse and touch paths. Confirm Escape/close behavior, focus return, 200% zoom and short landscape with the approved assets.
- **Impact:** High
- **Effort:** Medium

### IMP-DESIGN-04 — Finish the main pages with a single invitation

- **Status:** Proposed
- **Priority:** P2
- **Affected area:** Existing home, portfolio, services and about callouts and their visual handoff to the shared footer.
- **Evidence:** **Source and Visual** — All four callouts put contact first with `.button--light` and packages second with `.button--primary`. Light mode shows a light contact pill on rosewood. The sampled dark home and portfolio use a gold fill on the package link and a darker contact pill. The mobile footer below is a long stack of four distinct groups. **Historical** — The service and about closing destinations were established in the UX cycle. [Home callout](index.html#L379) · [Portfolio callout](realizacje.html#L428) · [Button styles](css/components/buttons.css) · [Footer](partials/footer.html) · [Completed UX work](docs/archive/improvements/IMPROVEMENTS-UX-2026-11-15.md)
- **Current state:** A full-width invitation precedes the footer. It contains a heading, supporting sentence and two links. The footer has its own brand, navigation, author contact, social and legal content.
- **Design judgment:** The closing title and contact action can provide a quieter ending after the portfolio imagery. Their relationship should read consistently in both editions, including the point where the author and legal information take over.
- **Proposed improvement:** Use the closing heading and contact action as a paired focal point. Treat the package link as the quieter next step, with a consistent contrast relationship in both themes. Carry a shared alignment and fine divider into the handoff to the footer so the invitation and the utility material have distinct visual roles.
- **Expected value:** Gives four journeys a deliberate finish and keeps the author attribution visible in the site's final composition.
- **Implementation scope:** Scope the treatment to existing callouts and their junction with the footer. Preserve all current link labels, targets and order, footer groups, author disclosure and notice behavior. Verify that the standalone footer still works on pages without a callout.
- **Dependencies:** Direction approval and shared material roles. This work can proceed independently of the planning and gallery layouts.
- **Acceptance criteria:** At 1440, 820 and 390 px in both themes the contact action receives the strongest visual emphasis, with the package link readable, recognisably interactive and reachable in its existing tab order. Check foreground, control and focus contrast on both callout surfaces. Confirm wrapping at 200% zoom and readable author and legal links on mobile and on a page without a callout.
- **Impact:** Medium
- **Effort:** Small

## 8. Suggested implementation sequence and dependencies

1. Approve the editorial direction and the treatment of representative material. Resolve the portfolio image pairing and confirm rights for assets whose presentation will change. These decisions gate final gallery and crop approval.
2. Establish the display, caption, rule, surface and action roles through the home cover. Review desktop, tablet and mobile composition in both themes, then apply the functional variant to contact. The planning layout can be developed from the agreed roles using existing copy, independently of image clearance.
3. Review home benefits and the five-step sequence, then review one services chapter before extending the composition to the remaining four. In parallel, the callout and footer transition can be reviewed independently on home and one secondary page.
4. Once the portfolio assets and captions are approved, review the featured scene and index with the final images and the existing lightbox. Recheck the home preview at the transition into the closing callout.
5. Review the full home → services or offer → gallery → contact sequence in both themes. For later HTML or CSS changes, use `npm run check` and focused browser review. For changed contracts, use the relevant smoke spec through the documented production build, for example `npm run test:smoke -- tests/portfolio-lightbox.spec.js` for the gallery. [Verification guide](README.md#testing)

## 9. Verification performed and limitations

- **Source checks.** Used `rg` and PowerShell file reads to inspect the sources and archive, and `Get-FileHash` plus the installed Sharp library to compare the portfolio images. `npm run check` passed for all eleven HTML entries, 400 local references, 65 in-document ID references and public URL checks. Reviewed report references and whitespace with local checks and `git diff --check`.
- **Visual and runtime checks.** Used existing Playwright and installed Chrome with a local Vite development server and temporary captures. At 1440 × 900, reviewed all six primary routes and supporting-page openings in light, including the full cookies document, and inspected home and portfolio in dark. At 820 × 1180, inspected the light home, portfolio and contact openings. At 390 × 844, inspected the light and dark home and portfolio openings and the dark contact and closing layouts. Reviewed the notice and first portfolio lightbox on light desktop and dark mobile, plus the dark mobile menu. Sampled home geometry and navigation mode at 899, 900, 1023 and 1024 px.
- **Observed interactions.** Verified system-derived light and dark rendering, an explicit switch to dark, project-notice acceptance, mobile menu open and Escape close with focus restoration, and the first gallery item opening by Enter and emulated tap and closing by Escape and the close control respectively, with focus returned. Checked loaded font families, sampled local image decoding, root-level horizontal overflow and the home reduced-motion transform. Local images were forced eager for capture, so this does not establish loading timing.
- **Limits.** Browser coverage was selective and used a local development render and mobile emulation. External requests were blocked for the review, including the map. Production build and deployment, Netlify form delivery, other browser engines, physical devices, zoom and short-landscape interactions, all gallery activation paths and formal contrast or accessibility conformance were outside the verification performed.

## 10. Owner decisions required

1. Approve the ceremony and planning editorial direction and the emphasis of the home cover, gallery and closing contact action.
2. Confirm the intended Vineyard Glow and Modern Glam artwork, choose the featured gallery scene and confirm rights for any newly prominent or recropped imagery.
3. Confirm the editorial framing of portfolio scenes and the provenance of the testimonials before any approved future work promotes them as evidence of real projects.
