# ami — The Art of Scent

A scroll-controlled walkthrough of the ami fragrance house. The homepage is one
cinematic journey: the supplied boutique footage is scrubbed frame by frame
against scroll position, and every piece of copy is keyed to the same timeline,
so the page reads as a camera move rather than a stack of sections.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · GSAP +
ScrollTrigger · Lenis · sharp (build-time image pipeline).

## Running it

```bash
npm install
npm run frames   # build the frame sequence from the source JPEGs (run once)
npm run dev
```

`npm run frames` reads `ezgif-7c37c7cc4726c02e-jpg/` and writes
`public/frames/` plus `lib/frame-manifest.json`. Both are required before the
app will build, and the source folder is the only place the original asset
lives — don't delete it.

```bash
npm run build && npm start
```

## The asset pipeline

`scripts/optimize-frames.mjs` turns 151 source JPEGs (832 × 1120) into two WebP
ladders:

| tier    | width | total    | used for        |
| ------- | ----- | -------- | --------------- |
| desktop | 832px | ~5.3 MB  | ≥ 768px         |
| mobile  | 624px | ~3.6 MB  | < 768px         |

Two things happen during encoding:

- **Watermarks are cropped off.** The source frames carry a generator badge in
  the top-left and two credits along the bottom edge. A uniform crop (58px top,
  84px bottom) removes them without disturbing the camera move — the crop is
  identical on every frame, so nothing drifts while scrubbing.
- **A blurred 32px poster** is inlined into the manifest and used as the
  preloader's backdrop, so the first paint is already warm.

## How the journey works

`components/FilmStage.tsx` owns a single 520vh scroll region. Inside it:

- `CinemaCanvas` scrubs the sequence onto a `<canvas>`, driven by one
  ScrollTrigger with `scrub: 0.9` — the lag is what turns discrete frames into
  a camera move. It is fully reversible and never snaps.
- One pinned viewport carries all three beats (arrival, threshold, collection).
  Keeping them on **one master timeline** rather than three independent
  triggers is what stops the sequence reading as a slideshow.

Narrative anchors live in `lib/frames.ts` (`BEAT`), mapped from the footage:
the camera leaves the pavement around 0.30, crosses the threshold at 0.45 and
is standing in the room by 0.66.

### Framing a portrait asset on a landscape screen

The footage is portrait (832 × 978 after cropping) and the frame always covers
the viewport edge to edge. On a landscape screen that necessarily crops it
vertically — on a 2.1:1 window you see roughly the middle 40% of the frame's
height.

The thing a *centred* crop throws away first is the illuminated storefront sign
across the top of frame 1, which is the brand. So the crop is not centred. It
rides high while the sign is in shot and eases to centre by the time the camera
is through the door:

```
t      = min(1, frame / (FRAME_COUNT * 0.34))
focusY = 0.06 + 0.44 * smoothstep(t)     // 0 = top of frame, 0.5 = centred
```

`focusY` is derived from the frame index rather than its own ScrollTrigger, so
it stays exactly in step with the scrub and reverses with it. The slow downward
drift also reads as a natural camera tilt as you walk in. On phones the viewport
is narrower than the frame, so cover crops the sides instead and `focusY` has
no effect.

**Resolution ceiling.** 832px is all the detail the asset has, so on a wide
screen it is upscaled ~2.3×. Two mitigations: the encoder applies a light
unsharp pass, and the canvas backing store is capped at `FRAME_WIDTH * 1.6`
rather than blindly following `devicePixelRatio` — rendering a 2.3× upscale at
2× DPR costs three times as much per frame and buys nothing. If you ever get a
higher-resolution or landscape master, drop it into the source folder and
re-run `npm run frames`; nothing else needs to change.

### The grade

White type over a brightly lit beige interior is unreadable, but permanently
dimming the footage wastes the asset. So the film timeline animates a **focused
radial scrim** and a **rack-focus blur** on the canvas: the set dims and softens
as a statement arrives, and opens back up while the camera travels. Values live
in one place (`grade()` in `FilmStage.tsx`).

## Loading

`lib/useFrameSequence.ts` streams the sequence in two passes — 14 priority
frames at concurrency 6, then the remainder at concurrency 4. The preloader only
waits on the priority batch; everything else arrives behind the revealed page,
and the canvas falls back to the nearest decoded frame if it is ever ahead of
the network. Nothing blocks the main thread: decoding goes through
`img.decode()` where available.

The preloader's indicator sweeps (pure CSS, alive from first paint) until the
first frame reports in, then switches to a real, eased percentage — it never
claims progress it doesn't have.

On a throttled 1.6 Mbps connection the experience hands over at ~8s; on
broadband it is gated by `MIN_VISIBLE_MS` (1.6s), because a loader that blinks
reads as a glitch rather than a house.

## Conventions worth knowing

- **GSAP is registered once**, in `lib/gsap.ts`, at module scope. Effects run
  child-first, so registering ScrollTrigger inside a provider's effect is
  already too late for the components beneath it. Always import from there.
- **Reveals are gated on `revealed`** (`useReveal({ enabled: revealed })`).
  While the preloader is up the document is height-locked, so any trigger
  created then measures against a collapsed page.
- **Never animate the same property on the same element from two places.**
  Parallax drift and line reveals both write `transform`, so they are given
  separate wrapper layers (see `ScentStory`).
- **Bottles are vector, not photography** (`components/Bottle.tsx`). Strokes use
  `currentColor` so one drawing sits correctly on ivory and on ink.
- `#collection` lives inside a pinned viewport, so its offset is meaningless as
  a scroll target; `Nav` resolves it to a position along the film instead.

## Accessibility

`prefers-reduced-motion` is honoured throughout: Lenis is not started, the
frame scrub is replaced by a static establishing shot, the pinned beats fall
back to readable stacked blocks, and all reveals resolve to their final state.
The custom cursor and magnetic buttons are fine-pointer only.
