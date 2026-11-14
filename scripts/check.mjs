import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  htmlPages,
  inlineThemeBootstrap,
  readSharedShell,
  readThemeBootstrap,
  resolveSharedShell
} from "./html-shell.mjs";

// Source-consistency check. It runs the production shell contracts from `scripts/html-shell.mjs`
// in memory and resolves the local references the maintained source declares. Nothing here writes:
// the build stays the only command that produces `dist/`.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const partialFiles = ["partials/header.html", "partials/footer.html"];
const styleRoot = "css";
const webManifestFile = "assets/favicon/site.webmanifest";

const failures = [];
const counts = { pages: 0, partials: 0, stylesheets: 0, manifests: 0, references: 0, idDocuments: 0, idReferences: 0 };

const fail = (source, message) => {
  failures.push(`${source}: ${message}`);
};

const toProjectRelativePath = (absolutePath) => {
  return path.relative(projectRoot, absolutePath).replace(/\\/g, "/");
};

const readMaintainedFile = (relativePath) => {
  const absolutePath = path.join(projectRoot, relativePath);
  const stats = statSync(absolutePath, { throwIfNoEntry: false });

  if (!stats?.isFile()) {
    fail(relativePath, "maintained source file is missing");
    return null;
  }

  return readFileSync(absolutePath, "utf8");
};

const collectStylesheets = (relativeDirectory) => {
  const absoluteDirectory = path.join(projectRoot, relativeDirectory);
  const stats = statSync(absoluteDirectory, { throwIfNoEntry: false });

  if (!stats?.isDirectory()) {
    fail(relativeDirectory, "maintained stylesheet directory is missing");
    return [];
  }

  return readdirSync(absoluteDirectory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = `${relativeDirectory}/${entry.name}`;

      if (entry.isDirectory()) {
        return collectStylesheets(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".css") ? [entryPath] : [];
    })
    .sort();
};

// Anything carrying a scheme, a protocol-relative host or only a fragment addresses something
// other than a file in this repository, so it is outside what this check can resolve.
const nonLocalReferencePattern = /^(?:[a-zA-Z][a-zA-Z0-9+.-]*:|\/\/|#|$)/;

const resolveReference = (reference, baseDirectory) => {
  // Query strings and fragments are addressing detail, never part of the filesystem path.
  const [pathname] = reference.split("#")[0].split("?");

  if (!pathname) {
    return null;
  }

  return pathname.startsWith("/")
    ? path.resolve(projectRoot, `.${pathname}`)
    : path.resolve(baseDirectory, pathname);
};

const checkReference = (sourceFile, reference, baseDirectory) => {
  const trimmedReference = reference.trim();

  if (nonLocalReferencePattern.test(trimmedReference)) {
    return;
  }

  const target = resolveReference(trimmedReference, baseDirectory);

  if (target === null) {
    return;
  }

  counts.references += 1;

  if (target !== projectRoot && !target.startsWith(`${projectRoot}${path.sep}`)) {
    fail(sourceFile, `local reference "${trimmedReference}" resolves outside the project root`);
    return;
  }

  const stats = statSync(target, { throwIfNoEntry: false });

  if (!stats?.isFile()) {
    fail(sourceFile, `unresolved local reference "${trimmedReference}" (expected ${toProjectRelativePath(target)})`);
  }
};

const htmlCommentPattern = /<!--[\s\S]*?-->/g;
const scriptBodyPattern = /(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi;
const htmlTagPattern = /<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;
const htmlAttributePattern = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

// The reference-bearing attributes this repository actually uses. `<base href>` declares the
// document base rather than a file, and `action` is a reference only on a form.
const isReferenceAttribute = (tagName, attributeName) => {
  if (tagName === "base") {
    return false;
  }

  if (attributeName === "action") {
    return tagName === "form";
  }

  return ["src", "href", "srcset", "data-partial-src"].includes(attributeName);
};

const splitAttributeReferences = (attributeName, value) => {
  if (attributeName !== "srcset") {
    return [value];
  }

  // Each `srcset` candidate is its own reference; the descriptor after it is not part of the URL.
  return value
    .split(",")
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);
};

// Yields every tag of the markup with its lowercased name and its valued attributes. Comments and
// script bodies are stripped first, so neither contributes tags, references nor IDs.
function* scanHtmlTags(html) {
  const markup = html.replace(htmlCommentPattern, "").replace(scriptBodyPattern, "$1$2");

  for (const [, tagName, attributes] of markup.matchAll(htmlTagPattern)) {
    const attributeEntries = [...attributes.matchAll(htmlAttributePattern)].map(
      ([, name, doubleQuoted, singleQuoted, unquoted]) => {
        return [name.toLowerCase(), doubleQuoted ?? singleQuoted ?? unquoted ?? ""];
      }
    );

    yield [tagName.toLowerCase(), attributeEntries];
  }
}

const checkHtmlReferences = (sourceFile, html, baseDirectory) => {
  for (const [tag, attributes] of scanHtmlTags(html)) {
    for (const [attributeName, value] of attributes) {
      if (!isReferenceAttribute(tag, attributeName)) {
        continue;
      }

      splitAttributeReferences(attributeName, value).forEach((reference) => {
        checkReference(sourceFile, reference, baseDirectory);
      });
    }
  }
};

// Attributes whose value is a whitespace-separated list of IDs in the same document.
const idReferenceListAttributes = ["aria-labelledby", "aria-describedby", "aria-controls"];
const htmlWhitespacePattern = /[\t\n\f\r ]+/;

// Returns the ID a fragment-only `href` addresses, or null when the value is not one. `#` alone
// (and `#top` without a matching element) addresses the top of the document, not an element.
const getFragmentTarget = (value) => {
  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith("#") || trimmedValue.length === 1) {
    return null;
  }

  try {
    return decodeURIComponent(trimmedValue.slice(1));
  } catch {
    return trimmedValue.slice(1);
  }
};

const collectIdReferences = (tag, attributes) => {
  return attributes.flatMap(([attributeName, value]) => {
    if (idReferenceListAttributes.includes(attributeName)) {
      return value
        .split(htmlWhitespacePattern)
        .filter(Boolean)
        .map((id) => ({ attribute: attributeName, value, id }));
    }

    if (attributeName === "for" && tag === "label" && value !== "") {
      return [{ attribute: "label[for]", value, id: value }];
    }

    if (attributeName === "href" && tag !== "base") {
      const id = getFragmentTarget(value);
      return id === null ? [] : [{ attribute: "href", value, id }];
    }

    return [];
  });
};

// Checks one document with the shared shell already resolved into it, so IDs and references from
// the page and both partials meet exactly as they do in the production output. IDs are collected
// before references are resolved, which keeps forward references valid.
const checkIdIntegrity = (page, html) => {
  const idOccurrences = new Map();
  const references = [];

  for (const [tag, attributes] of scanHtmlTags(html)) {
    attributes.forEach(([attributeName, value]) => {
      if (attributeName === "id" && value !== "") {
        idOccurrences.set(value, (idOccurrences.get(value) ?? 0) + 1);
      }
    });

    references.push(...collectIdReferences(tag, attributes));
  }

  counts.idDocuments += 1;

  idOccurrences.forEach((occurrences, id) => {
    if (occurrences > 1) {
      fail(page, `duplicate id "${id}" (${occurrences} elements in the document with the shared shell resolved)`);
    }
  });

  references.forEach(({ attribute, value, id }) => {
    counts.idReferences += 1;

    if (idOccurrences.has(id) || (attribute === "href" && id.toLowerCase() === "top")) {
      return;
    }

    const declaration = attribute === "label[for]" ? `label for="${value}"` : `${attribute}="${value}"`;
    fail(page, `${declaration} references missing id "${id}" in the document with the shared shell resolved`);
  });
};

const cssCommentPattern = /\/\*[\s\S]*?\*\//g;
const cssUrlPattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]+))\s*\)/g;
const cssBareImportPattern = /@import\s+(?:"([^"]*)"|'([^']*)')/g;

const checkCssReferences = (sourceFile, css) => {
  const styles = css.replace(cssCommentPattern, "");
  // `url()` and `@import` are authored relative to the stylesheet that declares them.
  const baseDirectory = path.dirname(path.join(projectRoot, sourceFile));

  for (const [, doubleQuoted, singleQuoted, bare] of styles.matchAll(cssUrlPattern)) {
    checkReference(sourceFile, doubleQuoted ?? singleQuoted ?? bare ?? "", baseDirectory);
  }

  for (const [, doubleQuoted, singleQuoted] of styles.matchAll(cssBareImportPattern)) {
    checkReference(sourceFile, doubleQuoted ?? singleQuoted ?? "", baseDirectory);
  }
};

const collectManifestSources = (value) => {
  if (Array.isArray(value)) {
    return value.flatMap(collectManifestSources);
  }

  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, entry]) => {
      return key === "src" && typeof entry === "string" ? [entry] : collectManifestSources(entry);
    });
  }

  return [];
};

const checkWebManifest = () => {
  const source = readMaintainedFile(webManifestFile);

  if (source === null) {
    return;
  }

  let manifest;

  try {
    manifest = JSON.parse(source);
  } catch (error) {
    fail(webManifestFile, `is not valid JSON: ${error.message}`);
    return;
  }

  counts.manifests += 1;
  // Manifest icon sources are resolved against the manifest itself, as the browser resolves them.
  const baseDirectory = path.dirname(path.join(projectRoot, webManifestFile));

  collectManifestSources(manifest).forEach((reference) => {
    checkReference(webManifestFile, reference, baseDirectory);
  });
};

// The build's own contracts, run against the source without producing the transformed document:
// required partial hosts, exactly one `aria-current="page"` on a primary-navigation page, and the
// synchronous theme-bootstrap tag. Returns each page whose shared shell resolved, in memory only.
const checkSharedShellContracts = (pageSources) => {
  const resolvedPages = new Map();
  let shell;
  let themeBootstrap;

  try {
    shell = readSharedShell();
    themeBootstrap = readThemeBootstrap();
  } catch (error) {
    fail("scripts/html-shell.mjs", `shared shell sources could not be read: ${error.message}`);
    return resolvedPages;
  }

  htmlPages.forEach((page) => {
    const html = pageSources.get(page);

    if (html === undefined) {
      return;
    }

    try {
      const resolvedHtml = resolveSharedShell(html, page, shell);
      resolvedPages.set(page, resolvedHtml);
      inlineThemeBootstrap(resolvedHtml, themeBootstrap);
    } catch (error) {
      fail(page, error.message);
    }
  });

  return resolvedPages;
};

const report = () => {
  console.log("EverAfter Ring — source check");
  console.log(
    `- shared shell: ${counts.pages} of ${htmlPages.length} maintained pages checked against the build contracts`
  );
  console.log(
    `- local references: ${counts.references} checked across ${counts.pages} pages, ${counts.partials} partials, ${counts.stylesheets} stylesheets and ${counts.manifests} web manifest`
  );
  console.log(
    `- ID references: ${counts.idReferences} checked (aria-labelledby, aria-describedby, aria-controls, label[for], fragment-only href) and IDs checked for uniqueness across ${counts.idDocuments} pages with the shared shell resolved`
  );

  if (failures.length === 0) {
    console.log("All checks passed. No files were written.");
    return;
  }

  console.error(`\n${failures.length} check${failures.length === 1 ? "" : "s"} failed:`);
  failures.forEach((failure, index) => console.error(`  ${index + 1}. ${failure}`));
  process.exitCode = 1;
};

const main = () => {
  const pageSources = new Map();

  htmlPages.forEach((page) => {
    const html = readMaintainedFile(page);

    if (html === null) {
      return;
    }

    counts.pages += 1;
    pageSources.set(page, html);
  });

  const resolvedPages = checkSharedShellContracts(pageSources);

  // ID integrity is checked on the resolved document, where page and partial IDs share one scope.
  resolvedPages.forEach((html, page) => checkIdIntegrity(page, html));

  // A top-level document sits at the project root, so its relative references resolve from there.
  pageSources.forEach((html, page) => checkHtmlReferences(page, html, projectRoot));

  // The partials are fragments injected into those top-level documents, in development by
  // `js/modules/partials.js` and in production by the shared shell, so their references resolve
  // from the root as well rather than from `partials/`.
  partialFiles.forEach((partial) => {
    const html = readMaintainedFile(partial);

    if (html === null) {
      return;
    }

    counts.partials += 1;
    checkHtmlReferences(partial, html, projectRoot);
  });

  collectStylesheets(styleRoot).forEach((stylesheet) => {
    const css = readMaintainedFile(stylesheet);

    if (css === null) {
      return;
    }

    counts.stylesheets += 1;
    checkCssReferences(stylesheet, css);
  });

  checkWebManifest();

  report();
};

main();
