import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, minifySync } from "vite";
import {
  htmlPages,
  inlineThemeBootstrap,
  readSharedShell,
  readThemeBootstrap,
  resolveSharedShell
} from "./scripts/html-shell.mjs";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const devPort = 8181;
const previewPort = 8182;

// `assets/img-src/` holds the inputs for `npm run optimize:images`, never deployment payload.
const imageSourceDirectory = "img-src";
const metadataFiles = ["robots.txt", "sitemap.xml"];

const toPosixPath = (value) => value.replace(/\\/g, "/");

const toProjectRelativePath = (value) => {
  const normalized = toPosixPath(value);
  const rootPrefix = `${toPosixPath(projectRoot)}/`;

  return normalized.startsWith(rootPrefix) ? normalized.slice(rootPrefix.length) : normalized;
};

const getOriginalAssetPath = (assetInfo) => {
  const candidate = assetInfo.originalFileNames?.[0] ?? assetInfo.originalFileName;
  return candidate ? toProjectRelativePath(candidate) : null;
};

const isStylesheet = (assetInfo) => {
  const candidate = assetInfo.names?.[0] ?? assetInfo.name ?? "";
  return candidate.endsWith(".css");
};

// Everything under `assets/` is deployed at its authored path: the web manifest resolves its icons
// relative to itself, Open Graph metadata points at absolute `/assets/...` URLs, and the tracked
// image variants are referenced by generated `srcset` values. Hashing them would break those
// contracts, so only bundled output (CSS/JS) is content-hashed.
const resolveAssetFileName = (assetInfo) => {
  const originalPath = getOriginalAssetPath(assetInfo);

  if (originalPath?.startsWith("assets/")) {
    return originalPath;
  }

  return isStylesheet(assetInfo) ? "css/[name]-[hash][extname]" : "assets/[name]-[hash][extname]";
};

const copyStaticAssets = (outDir) => {
  const assetsSource = path.join(projectRoot, "assets");

  if (existsSync(assetsSource)) {
    const assetsDestination = path.join(outDir, "assets");
    mkdirSync(assetsDestination, { recursive: true });

    readdirSync(assetsSource, { withFileTypes: true }).forEach((entry) => {
      if (entry.name === imageSourceDirectory) {
        return;
      }

      cpSync(path.join(assetsSource, entry.name), path.join(assetsDestination, entry.name), { recursive: true });
    });
  }

  metadataFiles.forEach((file) => {
    const source = path.join(projectRoot, file);

    if (existsSync(source)) {
      copyFileSync(source, path.join(outDir, file));
    }
  });
};

// The partials are shared-shell fragments, not documents. Serving them verbatim keeps the runtime
// loader in development injecting exactly the markup the production build resolves, instead of the
// fragment Vite would otherwise treat as an HTML entry.
const devPartialsPlugin = () => {
  const partialsRoot = path.join(projectRoot, "partials");

  return {
    name: "everafter-dev-partials",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const [requestPath] = (request.url ?? "").split("?");

        if (!requestPath.startsWith("/partials/") || !requestPath.endsWith(".html")) {
          next();
          return;
        }

        const partialFile = path.resolve(projectRoot, decodeURIComponent(requestPath).slice(1));

        if (!partialFile.startsWith(`${partialsRoot}${path.sep}`) || !existsSync(partialFile)) {
          next();
          return;
        }

        response.setHeader("Content-Type", "text/html; charset=utf-8");
        response.end(readFileSync(partialFile, "utf8"));
      });
    }
  };
};

// Production HTML transformation for the contracts Vite does not own: the shared shell,
// the active primary-navigation state and the synchronous theme bootstrap. Development keeps
// the runtime partial loader (`js/modules/partials.js`), so the plugin is build-only.
const sharedShellPlugin = () => {
  let sharedShell = null;
  let themeBootstrapCode = "";

  return {
    name: "everafter-shared-shell",
    apply: "build",
    buildStart() {
      sharedShell = readSharedShell();

      const { code, errors } = minifySync("theme-bootstrap.js", readThemeBootstrap());

      if (errors?.length) {
        throw new Error(`Failed to minify js/theme-bootstrap.js: ${errors.map((error) => error.message).join(", ")}`);
      }

      themeBootstrapCode = code;
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const page = path.basename(context.path ?? context.filename ?? "");

        if (!htmlPages.includes(page)) {
          throw new Error(`Unexpected HTML entry "${page}". Maintained pages are: ${htmlPages.join(", ")}.`);
        }

        return inlineThemeBootstrap(resolveSharedShell(html, page, sharedShell), themeBootstrapCode);
      }
    }
  };
};

// The deployable static tree and the metadata files are copied verbatim, so assets that are only
// referenced from the web manifest or from absolute metadata URLs also reach `dist/`.
const staticAssetsPlugin = () => {
  let outDir = "";

  return {
    name: "everafter-static-assets",
    apply: "build",
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      copyStaticAssets(outDir);
    }
  };
};

export default defineConfig({
  root: projectRoot,
  base: "/",
  // The deployable static tree keeps its authored location, so it is copied explicitly
  // instead of through a public directory.
  publicDir: false,
  appType: "mpa",
  server: {
    port: devPort
  },
  preview: {
    port: previewPort
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    // Keeps every local reference a real file request, as the current production output does.
    assetsInlineLimit: 0,
    rollupOptions: {
      input: Object.fromEntries(
        htmlPages.map((page) => [page.replace(/\.html$/, ""), path.resolve(projectRoot, page)])
      ),
      output: {
        entryFileNames: "js/[name]-[hash].js",
        chunkFileNames: "js/[name]-[hash].js",
        assetFileNames: resolveAssetFileName
      }
    }
  },
  plugins: [devPartialsPlugin(), sharedShellPlugin(), staticAssetsPlugin()]
});
