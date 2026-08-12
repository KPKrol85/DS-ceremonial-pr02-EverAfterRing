import { build as bundleScript } from "esbuild";
import { bundle as bundleStyles } from "lightningcss";
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");

const htmlPages = [
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

const primaryNavPages = new Set([
  "index.html",
  "oferta.html",
  "uslugi.html",
  "realizacje.html",
  "o-nas.html",
  "kontakt.html"
]);

const ensureDir = (targetPath) => {
  mkdirSync(targetPath, { recursive: true });
};

const readProjectFile = (relativePath) => {
  return readFileSync(path.join(projectRoot, relativePath), "utf8");
};

const writeDistFile = (relativePath, contents) => {
  const destination = path.join(distRoot, relativePath);
  ensureDir(path.dirname(destination));
  writeFileSync(destination, contents);
};

const indentBlock = (content, indentation) => {
  return content
    .split("\n")
    .map((line) => `${indentation}${line}`)
    .join("\n");
};

const cleanDist = () => {
  rmSync(distRoot, { recursive: true, force: true });
};

const buildCss = () => {
  ensureDir(path.join(distRoot, "css"));

  const { code } = bundleStyles({
    filename: path.join(projectRoot, "css", "main.css"),
    minify: true
  });

  writeDistFile(path.join("css", "main.min.css"), code);
};

const buildJs = async () => {
  ensureDir(path.join(distRoot, "js"));

  await Promise.all([
    bundleScript({
      entryPoints: [path.join(projectRoot, "js", "app.js")],
      bundle: true,
      format: "esm",
      minify: true,
      outfile: path.join(distRoot, "js", "app.min.js")
    }),
    bundleScript({
      entryPoints: [path.join(projectRoot, "js", "theme-bootstrap.js")],
      bundle: true,
      format: "iife",
      minify: true,
      outfile: path.join(distRoot, "js", "theme-bootstrap.min.js")
    })
  ]);
};

const getHeaderMarkupForPage = (page) => {
  let headerMarkup = readProjectFile(path.join("partials", "header.html")).trimEnd();
  const activeLinkPattern = `class="nav__link" href="${page}"`;

  if (headerMarkup.includes(activeLinkPattern)) {
    headerMarkup = headerMarkup.replace(
      activeLinkPattern,
      `class="nav__link" href="${page}" aria-current="page"`
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
    `<${tagName} class="site-${tagName}">\n${indentBlock(partialMarkup, "      ")}\n    </${tagName}>`
  );
};

const buildHtml = () => {
  const footerMarkup = readProjectFile(path.join("partials", "footer.html")).trimEnd();

  htmlPages.forEach((page) => {
    const sourceHtml = readProjectFile(page);
    const headerMarkup = getHeaderMarkupForPage(page);
    assertPrimaryNavActiveState(page, headerMarkup);
    const withHeader = replacePartialHost(sourceHtml, "header", "header", headerMarkup);
    const withFooter = replacePartialHost(withHeader, "footer", "footer", footerMarkup);
    const productionHtml = withFooter
      .replaceAll('href="css/main.css"', 'href="css/main.min.css"')
      .replaceAll('src="js/theme-bootstrap.js"', 'src="js/theme-bootstrap.min.js"')
      .replaceAll('src="js/app.js"', 'src="js/app.min.js"');

    writeDistFile(page, productionHtml);
  });
};

const copyAssets = () => {
  const assetsSource = path.join(projectRoot, "assets");
  if (existsSync(assetsSource)) {
    const assetsDestination = path.join(distRoot, "assets");
    ensureDir(assetsDestination);

    readdirSync(assetsSource, { withFileTypes: true }).forEach((entry) => {
      if (entry.name === "img-src") {
        return;
      }

      cpSync(path.join(assetsSource, entry.name), path.join(assetsDestination, entry.name), { recursive: true });
    });
  }

  ["robots.txt", "sitemap.xml"].forEach((file) => {
    const source = path.join(projectRoot, file);
    if (existsSync(source)) {
      writeDistFile(file, readFileSync(source));
    }
  });
};

const buildAll = async () => {
  cleanDist();
  buildCss();
  await buildJs();
  buildHtml();
  copyAssets();
};

const command = process.argv[2];

switch (command) {
  case "clean":
    cleanDist();
    break;
  case "css":
    buildCss();
    break;
  case "js":
    await buildJs();
    break;
  case "html":
    buildHtml();
    break;
  case "assets":
    copyAssets();
    break;
  case "build":
    await buildAll();
    break;
  default: {
    const available = ["clean", "css", "js", "html", "assets", "build"];
    throw new Error(`Unknown build command "${command}". Expected one of: ${available.join(", ")}`);
  }
}
