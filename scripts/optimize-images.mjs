import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const sourceRoot = path.join(projectRoot, "assets", "img-src");
const outputRoot = path.join(projectRoot, "assets", "img");

const supportedExtensions = new Set([".jpg", ".jpeg", ".png"]);
const targetWidths = [400, 800, 1200];
const formats = [
  {
    extension: "jpg",
    save: (image) => image.jpeg({ quality: 82, mozjpeg: true })
  },
  {
    extension: "webp",
    save: (image) => image.webp({ quality: 80 })
  },
  {
    extension: "avif",
    save: (image) => image.avif({ quality: 50 })
  }
];

const readFiles = async (directory, matchesName) => {
  let entries;

  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") {
      return [];
    }

    throw error;
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return readFiles(entryPath, matchesName);
      }

      if (!entry.isFile()) {
        return [];
      }

      return matchesName(entry.name) ? [entryPath] : [];
    })
  );

  return files.flat();
};

const getOutputWidths = (sourceWidth) => {
  const availableWidths = targetWidths.filter((width) => width <= sourceWidth);

  if (!availableWidths.includes(sourceWidth)) {
    availableWidths.push(sourceWidth);
  }

  return [...new Set(availableWidths)].sort((a, b) => a - b);
};

const optimizeImage = async (sourcePath) => {
  const relativePath = path.relative(sourceRoot, sourcePath);
  const relativeDirectory = path.dirname(relativePath);
  const parsedPath = path.parse(relativePath);
  const outputDirectory = path.join(outputRoot, relativeDirectory);
  const metadata = await sharp(sourcePath).metadata();

  if (!metadata.width) {
    throw new Error(`Could not read image width for ${relativePath}`);
  }

  await mkdir(outputDirectory, { recursive: true });

  const widths = getOutputWidths(metadata.width);

  const outputPaths = await Promise.all(
    widths.flatMap((width) =>
      formats.map(({ extension, save }) => {
        const outputPath = path.join(outputDirectory, `${parsedPath.name}-${width}.${extension}`);
        const image = sharp(sourcePath)
          .rotate()
          .resize({ width, withoutEnlargement: true });

        return save(image).toFile(outputPath).then(() => outputPath);
      })
    )
  );

  return { summary: `${relativePath}: ${widths.join(", ")}px`, outputPaths };
};

const isGeneratedVariant = (filename) => {
  const { name, ext } = path.parse(filename);
  return /^.+-[1-9]\d*$/s.test(name) && formats.some(({ extension }) => ext === `.${extension}`);
};

const outputPathKey = (filePath) => process.platform === "win32" ? filePath.toLowerCase() : filePath;

const reportStaleVariants = async (outputPaths) => {
  const expectedPaths = new Set(outputPaths.map(outputPathKey));
  const variants = await readFiles(outputRoot, isGeneratedVariant);
  const stalePaths = variants
    .filter((filePath) => !expectedPaths.has(outputPathKey(filePath)))
    .map((filePath) => path.relative(projectRoot, filePath).split(path.sep).join("/"))
    .sort();

  if (stalePaths.length === 0) {
    console.log("No stale generated image variants found.");
    return;
  }

  const label = stalePaths.length === 1 ? "variant" : "variants";
  console.warn(`Found ${stalePaths.length} stale generated image ${label}. These files were left untouched:`);
  stalePaths.forEach((filePath) => console.warn(`- ${filePath}`));
};

const main = async () => {
  const imageSources = await readFiles(sourceRoot, (filename) =>
    supportedExtensions.has(path.extname(filename).toLowerCase())
  );
  const results = await Promise.all(imageSources.map(optimizeImage));

  if (results.length === 0) {
    console.log("No source images found in assets/img-src. Skipping image optimization.");
  } else {
    console.log(`Optimized ${results.length} image source${results.length === 1 ? "" : "s"}:`);
    results.forEach(({ summary }) => console.log(`- ${summary}`));
  }

  await reportStaleVariants(results.flatMap(({ outputPaths }) => outputPaths));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
