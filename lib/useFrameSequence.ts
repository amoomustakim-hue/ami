"use client";

import { useEffect, useRef, useState } from "react";
import { FRAME_COUNT, PRIORITY_FRAMES, framePath, pickTier } from "./frames";

type SequenceState = {
  /** Decoded images, sparse until the background pass finishes. */
  frames: (HTMLImageElement | null)[];
  /** True once the opening frames are decoded and the page can be revealed. */
  ready: boolean;
  /** 0–1 across the priority batch — what the preloader counts. */
  progress: number;
};

function loadImage(src: string, signal: AbortSignal) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    if (signal.aborted) return resolve(null);
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    const done = (value: HTMLImageElement | null) => resolve(value);

    // decode() keeps the first paint off the main thread; older Safari throws,
    // so onload is kept as the fallback path.
    if (typeof img.decode === "function") {
      img
        .decode()
        .then(() => done(img))
        .catch(() => {
          if (img.complete && img.naturalWidth > 0) done(img);
          else {
            img.onload = () => done(img);
            img.onerror = () => done(null);
          }
        });
    } else {
      img.onload = () => done(img);
      img.onerror = () => done(null);
    }
  });
}

/**
 * Streams the walkthrough sequence: a small priority batch first so the hero can
 * paint, then everything else at a bounded concurrency so the network never
 * starves interaction. Nothing here blocks the main thread.
 */
export function useFrameSequence(enabled = true): SequenceState {
  const framesRef = useRef<(HTMLImageElement | null)[]>(
    new Array(FRAME_COUNT).fill(null)
  );
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const controller = new AbortController();
    const { signal } = controller;
    const tier = pickTier();
    const frames = framesRef.current;

    let cancelled = false;

    (async () => {
      // Pass 1 — the opening frames, in order, so the hero is correct on reveal.
      let decoded = 0;
      const priority = Math.min(PRIORITY_FRAMES, FRAME_COUNT);
      const head = Array.from({ length: priority }, (_, i) => i);

      await runPool(head, 6, async (i) => {
        const img = await loadImage(framePath(tier, i), signal);
        if (cancelled) return;
        frames[i] = img;
        decoded += 1;
        setProgress(decoded / priority);
      });

      if (cancelled) return;
      setReady(true);

      // Pass 2 — the remainder, lower concurrency so scrolling stays responsive.
      const tail = Array.from(
        { length: FRAME_COUNT - priority },
        (_, i) => i + priority
      );
      await runPool(tail, 4, async (i) => {
        const img = await loadImage(framePath(tier, i), signal);
        if (!cancelled) frames[i] = img;
      });
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [enabled]);

  return { frames: framesRef.current, ready, progress };
}

async function runPool<T>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<void>
) {
  let cursor = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const item = items[cursor++];
      await worker(item);
    }
  });
  await Promise.all(runners);
}
