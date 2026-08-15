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
const counts = { pages: 0, partials: 0, stylesheets: 0, manifests: 0, references: 0 };

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

const checkHtmlReferences = (sourceFile, html, baseDirectory) => {
  const markup = html.replace(htmlCommentPattern, "").replace(scriptBodyPattern, "$1$2");

  for (const [, tagName, attributes] of markup.matchAll(htmlTagPattern)) {
    const tag = tagName.toLowerCase();

    for (const [, name, doubleQuoted, singleQuoted, unquoted] of attributes.matchAll(htmlAttributePattern)) {
      const attributeName = name.toLowerCase();

      if (!isReferenceAttribute(tag, attributeName)) {
        continue;
      }

      const value = doubleQuoted ?? singleQuoted ?? unquoted ?? "";

      splitAttributeReferences(attributeName, value).forEach((reference) => {
        checkReference(sourceFile, reference, baseDirectory);
      });
    }
  }
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
// synchronous theme-bootstrap tag.
const checkSharedShellContracts = (pageSources) => {
  let shell;
  let themeBootstrap;

  try {
    shell = readSharedShell();
    themeBootstrap = readThemeBootstrap();
  } catch (error) {
    fail("scripts/html-shell.mjs", `shared shell sources could not be read: ${error.message}`);
    return;
  }

  htmlPages.forEach((page) => {
    const html = pageSources.get(page);

    if (html === undefined) {
      return;
    }

    try {
      inlineThemeBootstrap(resolveSharedShell(html, page, shell), themeBootstrap);
    } catch (error) {
      fail(page, error.message);
    }
  });
};

const report = () => {
  console.log("EverAfter Ring — source check");
  console.log(
    `- shared shell: ${counts.pages} of ${htmlPages.length} maintained pages checked against the build contracts`
  );
  console.log(
    `- local references: ${counts.references} checked across ${counts.pages} pages, ${counts.partials} partials, ${counts.stylesheets} stylesheets and ${counts.manifests} web manifest`
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

  checkSharedShellContracts(pageSources);

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
