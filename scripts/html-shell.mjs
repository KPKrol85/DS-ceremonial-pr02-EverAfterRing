import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

// The ten maintained top-level documents. Every one of them is a real, independent
// production input; the list is the single source of truth for the Vite MPA entries.
export const htmlPages = [
  "index.html",
  "oferta.html",
  "uslugi.html",
  "realizacje.html",
  "o-nas.html",
  "kontakt.html",
  "dziekujemy.html",
  "polityka-prywatnosci.html",
  "regulamin.html",
  "cookies.html"
];

// Pages that own a primary-navigation link. Only these may receive `aria-current="page"`.
export const primaryNavPages = new Set([
  "index.html",
  "oferta.html",
  "uslugi.html",
  "realizacje.html",
  "o-nas.html",
  "kontakt.html"
]);

const themeBootstrapTag = '<script src="js/theme-bootstrap.js"></script>';

const readProjectFile = (relativePath) => {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
};

const indentBlock = (content, indentation) => {
  return content
    .split("\n")
    .map((line) => `${indentation}${line}`)
    .join("\n");
};

// `partials/header.html` and `partials/footer.html` stay the single maintained copies of the
// shared shell; development loads them at runtime, production resolves them into the document.
export const readSharedShell = () => ({
  header: readProjectFile(path.join("partials", "header.html")).trimEnd(),
  footer: readProjectFile(path.join("partials", "footer.html")).trimEnd()
});

export const readThemeBootstrap = () => {
  return readProjectFile(path.join("js", "theme-bootstrap.js"));
};

const getHeaderMarkupForPage = (headerMarkup, page) => {
  const activeLinkPattern = `class="nav__link" href="${page}"`;

  if (headerMarkup.includes(activeLinkPattern)) {
    return headerMarkup.replace(
      activeLinkPattern,
      () => `class="nav__link" href="${page}" aria-current="page"`
    );
  }

  return headerMarkup;
};

const assertPrimaryNavActiveState = (page, headerMarkup) => {
  if (!primaryNavPages.has(page)) return;

  const expectedActiveLink = `class="nav__link" href="${page}" aria-current="page"`;
  const activeLinkCount = (headerMarkup.match(/class="nav__link"[^>]*aria-current="page"/g) || []).length;
  const expectedActiveLinkCount = headerMarkup.includes(expectedActiveLink) ? 1 : 0;

  if (expectedActiveLinkCount !== 1 || activeLinkCount !== 1) {
    throw new Error(
      `Invalid active primary navigation state for ${page}. Expected exactly one nav__link with href="${page}" and aria-current="page"; found ${activeLinkCount}.`
    );
  }
};

const replacePartialHost = (html, tagName, partialName, partialMarkup) => {
  const hostPattern = new RegExp(
    `<${tagName} class="site-${tagName}"[^>]*data-partial="${partialName}"[^>]*><\\/${tagName}>`,
    "i"
  );

  if (!hostPattern.test(html)) {
    throw new Error(`Missing ${partialName} partial host in source HTML.`);
  }

  return html.replace(
    hostPattern,
    () => `<${tagName} class="site-${tagName}">\n${indentBlock(partialMarkup, "      ")}\n    </${tagName}>`
  );
};

// Production documents ship the resolved shared shell instead of empty partial hosts that
// would depend on a runtime fetch, and carry the active primary-navigation state statically.
export const resolveSharedShell = (html, page, shell) => {
  const headerMarkup = getHeaderMarkupForPage(shell.header, page);
  assertPrimaryNavActiveState(page, headerMarkup);

  const withHeader = replacePartialHost(html, "header", "header", headerMarkup);
  return replacePartialHost(withHeader, "footer", "footer", shell.footer);
};

// The bootstrap has to resolve the theme before the first paint. Inlining the classic script
// keeps it synchronous, in place and ahead of the stylesheet, with `js/theme-bootstrap.js`
// remaining the one maintained source that development loads directly.
export const inlineThemeBootstrap = (html, code) => {
  if (!html.includes(themeBootstrapTag)) {
    throw new Error(`Missing synchronous theme bootstrap script (${themeBootstrapTag}) in source HTML.`);
  }

  return html.replace(themeBootstrapTag, () => `<script>${code}</script>`);
};
