/**
 * Builds the scroll-scrub frame sequence from the source walkthrough JPEGs.
 *
 * The source frames carry baked-in watermarks (an "AI" badge in the top-left and
 * two generator credits along the bottom edge), so every frame is cropped before
 * it is re-encoded. The crop is uniform across the sequence, which keeps the
 * camera move perfectly stable while scrubbing.
 *
 * If scripts/ai-upscale.py has produced frames-master/ (Real-ESRGAN, already
 * cropped, 1664 px wide), those are used instead: they carry restored detail,
 * so the ladders can go well past the 832 px source.
 *
 * Outputs two WebP ladders — one for desktop, one for narrow viewports — plus a
 * tiny blurred poster used for the first paint behind the preloader.
 */
import sharp from "sharp";
import { mkdir, readdir, writeFile, rm } from "node:fs/promises";
import path from "node:path";

const RAW_DIR = path.join(process.cwd(), "ezgif-7c37c7cc4726c02e-jpg");
const MASTER_DIR = path.join(process.cwd(), "frames-master");
const OUT_DIR = path.join(process.cwd(), "public", "frames");

// Watermark bands, in source pixels (source frames are 832 x 1120).
const CROP_TOP = 58;
const CROP_BOTTOM = 84;

// Raw frames: nothing to gain above their native 832 px.
const RAW_LADDER = [
  { name: "desktop", width: 832, quality: 74 },
  { name: "mobile", width: 624, quality: 70 },
];
// AI masters: sharp enough to fill a 1440 px screen, and a 2x phone.
const MASTER_LADDER = [
  { name: "desktop", width: 1440, quality: 78 },
  { name: "mobile", width: 828, quality: 74 },
];

const list = async (dir, pattern) =>
  (await readdir(dir).catch(() => [])).filter((f) => pattern.test(f)).sort();

async function main() {
  const raw = await list(RAW_DIR, /\.jpe?g$/i);
  if (!raw.length) throw new Error(`No source frames found in ${RAW_DIR}`);
  const masters = await list(MASTER_DIR, /\.webp$/i);
  // Only use the masters once every frame has one.
  const useMasters = masters.length === raw.length;
  const SRC_DIR = useMasters ? MASTER_DIR : RAW_DIR;
  const files = useMasters ? masters : raw;
  const LADDER = useMasters ? MASTER_LADDER : RAW_LADDER;

  const probe = await sharp(path.join(SRC_DIR, files[0])).metadata();
  // Masters are already cropped.
  const top = useMasters ? 0 : CROP_TOP;
  const cropHeight = probe.height - (useMasters ? 0 : CROP_TOP + CROP_BOTTOM);
  console.log(
    `${useMasters ? "AI masters" : "raw frames"} ${probe.width}x${probe.height} -> ${probe.width}x${cropHeight} (${files.length} frames)`
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
        .extract({ left: 0, top, width: probe.width, height: cropHeight })
        .resize({ width: tier.width, withoutEnlargement: true, kernel: "lanczos3" })
        // A light unsharp pass for the downscale; anything stronger haloes the
        // soft lighting. The raw frames need a touch more to survive upscaling.
        .sharpen(useMasters ? { sigma: 0.45, m1: 0.3, m2: 0.4 } : { sigma: 0.6, m1: 0.4, m2: 0.7 })
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
    .extract({ left: 0, top, width: probe.width, height: cropHeight })
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
