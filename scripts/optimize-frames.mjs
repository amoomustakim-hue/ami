/**
 * Builds the scroll-scrub frame sequence from the source walkthrough JPEGs.
 *
 * The source frames carry baked-in watermarks (an "AI" badge in the top-left and
 * two generator credits along the bottom edge), so every frame is cropped before
 * it is re-encoded. The crop is uniform across the sequence, which keeps the
 * camera move perfectly stable while scrubbing.
 *
 * Outputs two WebP ladders — one for desktop, one for narrow viewports — plus a
 * tiny blurred poster used for the first paint behind the preloader.
 */
import sharp from "sharp";
import { mkdir, readdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const SRC_DIR = path.join(process.cwd(), "ezgif-7c37c7cc4726c02e-jpg");
const OUT_DIR = path.join(process.cwd(), "public", "frames");

// Watermark bands, in source pixels (source frames are 832 x 1120).
const CROP_TOP = 58;
const CROP_BOTTOM = 84;

const LADDER = [
  { name: "desktop", width: 832, quality: 74 },
  { name: "mobile", width: 624, quality: 70 },
];

async function main() {
  const files = (await readdir(SRC_DIR))
    .filter((f) => /\.jpe?g$/i.test(f))
    .sort();

  if (!files.length) throw new Error(`No source frames found in ${SRC_DIR}`);

  const probe = await sharp(path.join(SRC_DIR, files[0])).metadata();
  const cropHeight = probe.height - CROP_TOP - CROP_BOTTOM;
  console.log(
    `source ${probe.width}x${probe.height} -> cropped ${probe.width}x${cropHeight} (${files.length} frames)`
  );

  await rm(OUT_DIR, { recursive: true, force: true });
  for (const tier of LADDER) await mkdir(path.join(OUT_DIR, tier.name), { recursive: true });

  const bytes = Object.fromEntries(LADDER.map((t) => [t.name, 0]));

  for (let i = 0; i < files.length; i++) {
    const src = path.join(SRC_DIR, files[i]);
    const index = String(i + 1).padStart(4, "0");

    for (const tier of LADDER) {
      const out = path.join(OUT_DIR, tier.name, `${index}.webp`);
      const info = await sharp(src)
        .extract({ left: 0, top: CROP_TOP, width: probe.width, height: cropHeight })
        .resize({ width: tier.width, withoutEnlargement: true })
        // The frame is drawn edge-to-edge, so on a wide screen it is upscaled
        // well beyond its native width. A light unsharp pass gives that upscale
        // something to hold on to; anything stronger haloes the soft lighting.
        .sharpen({ sigma: 0.6, m1: 0.4, m2: 0.7 })
        .webp({ quality: tier.quality, effort: 6 })
        .toFile(out);
      bytes[tier.name] += info.size;
    }

    if ((i + 1) % 25 === 0 || i === files.length - 1) {
      console.log(`  encoded ${i + 1}/${files.length}`);
    }
  }

  // Blurred poster: shown instantly while the sequence streams in.
  const poster = await sharp(path.join(SRC_DIR, files[0]))
    .extract({ left: 0, top: CROP_TOP, width: probe.width, height: cropHeight })
    .resize({ width: 32 })
    .blur(2)
    .webp({ quality: 50 })
    .toBuffer();

  const manifest = {
    count: files.length,
    width: probe.width,
    height: cropHeight,
    aspect: +(probe.width / cropHeight).toFixed(6),
    tiers: Object.fromEntries(LADDER.map((t) => [t.name, { width: t.width }])),
    poster: `data:image/webp;base64,${poster.toString("base64")}`,
  };

  await writeFile(
    path.join(process.cwd(), "lib", "frame-manifest.json"),
    JSON.stringify(manifest, null, 2)
  );

  for (const tier of LADDER) {
    console.log(`${tier.name}: ${(bytes[tier.name] / 1024 / 1024).toFixed(2)} MB`);
  }
  console.log("manifest -> lib/frame-manifest.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
