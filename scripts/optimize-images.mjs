import { readdir, stat, mkdir } from 'node:fs/promises';
import { createReadStream, createWriteStream, existsSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = path.resolve(process.cwd(), 'resources', 'images');
const exts = new Set(['.png', '.jpg', '.jpeg']);
const introBaseName = 'intro-img';
const responsiveWidths = [480, 768, 1024, 1440];

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) return walk(res);
    return res;
  }));
  return Array.prototype.concat(...files);
}

async function ensureDir(dir) {
  try {
    await mkdir(dir, { recursive: true });
  } catch {}
}

async function convertToWebp(file) {
  const ext = path.extname(file).toLowerCase();
  if (!exts.has(ext)) return null;
  const out = file.replace(ext, '.webp');
  if (existsSync(out)) return out;
  await sharp(file)
    .webp({ quality: 75 })
    .toFile(out);
  return out;
}

async function generateResponsiveVariants(srcFile) {
  try {
    const dir = path.dirname(srcFile);
    const base = path.basename(srcFile, path.extname(srcFile));
    if (base !== introBaseName) return [];
    const outputs = [];
    for (const w of responsiveWidths) {
      const out = path.join(dir, `${base}-w${w}.webp`);
      if (existsSync(out)) {
        outputs.push(out);
        continue;
      }
      await sharp(srcFile).resize({ width: w }).webp({ quality: 75 }).toFile(out);
      outputs.push(out);
      console.log('✓ responsive', path.relative(ROOT, out));
    }
    return outputs;
  } catch (e) {
    console.warn('x Failed responsive variants for', srcFile, e.message);
    return [];
  }
}

(async () => {
  console.log('Optimizing images under', ROOT);
  const all = (await walk(ROOT)).filter(f => exts.has(path.extname(f).toLowerCase()));
  let ok = 0, fail = 0;
  for (const f of all) {
    try {
      const out = await convertToWebp(f);
      if (out) {
        ok++;
        console.log('✓', path.relative(ROOT, f), '->', path.relative(ROOT, out));
      }
      // Generate responsive variants for intro image from the best available source (PNG/JPG)
      if (path.basename(f, path.extname(f)) === introBaseName) {
        await generateResponsiveVariants(f);
      }
    } catch (e) {
      fail++;
      console.warn('x Failed', f, e.message);
    }
  }
  // If source PNG/JPG didn't exist, try generating from existing WebP as a fallback
  const introFallbacks = [
    path.join(ROOT, `${introBaseName}.webp`),
  ];
  for (const candidate of introFallbacks) {
    if (existsSync(candidate)) {
      await generateResponsiveVariants(candidate);
      break;
    }
  }
  console.log(`Done. Converted ${ok} images, ${fail} failed.`);
})();
