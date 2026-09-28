"use client";

import { useId } from "react";

type BottleProps = {
  /** Liquid tone — always a muted, material colour from the house palette. */
  tone: string;
  /** Two or three letters etched on the label. */
  mark: string;
  className?: string;
  /** Broader silhouette for the flagship. */
  variant?: "tall" | "wide";
};

/**
 * Hand-drawn apothecary flacon.
 *
 * Deliberately vector rather than photographic: the brief rules out stock
 * imagery, and flat, softly-lit glass reads as part of the house's own material
 * language next to the footage. Strokes use `currentColor` so the same drawing
 * sits correctly on ivory and on ink.
 */
export function Bottle({ tone, mark, className = "", variant = "tall" }: BottleProps) {
  const uid = useId().replace(/:/g, "");
  const glass = `glass-${uid}`;
  const liquid = `liquid-${uid}`;
  const clip = `clip-${uid}`;

  const wide = variant === "wide";
  // Body geometry — everything else is positioned from these four numbers.
  const bx = wide ? 18 : 30;
  const bw = wide ? 164 : 140;
  const by = 80;
  const bh = 284;
  const bodyR = 5;

  // Shoulders sit just inside the body; the cap is wide and low, Byredo-ish.
  const capW = wide ? 88 : 76;
  const capX = 100 - capW / 2;
  const fillTop = by + bh * 0.34; // liquid line, kept low

  const labelW = wide ? 84 : 74;
  const labelX = 100 - labelW / 2;

  return (
    <svg
      viewBox="0 0 200 380"
      className={className}
      role="img"
      aria-label={`ami ${mark} flacon`}
      fill="none"
    >
      <defs>
        {/*
          Glass is read from its edges, not its face: thickness darkens the two
          sides while the middle stays clear. Using currentColor keeps that true
          on ivory and on ink.
        */}
        <linearGradient id={glass} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.17" />
          <stop offset="7%" stopColor="currentColor" stopOpacity="0.02" />
          <stop offset="46%" stopColor="currentColor" stopOpacity="0" />
          <stop offset="93%" stopColor="currentColor" stopOpacity="0.04" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.19" />
        </linearGradient>

        <linearGradient id={liquid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={tone} stopOpacity="0.62" />
          <stop offset="55%" stopColor={tone} stopOpacity="0.82" />
          <stop offset="100%" stopColor={tone} stopOpacity="0.92" />
        </linearGradient>

        <clipPath id={clip}>
          <rect x={bx} y={by} width={bw} height={bh} rx={bodyR} />
        </clipPath>
      </defs>

      {/* ---- neck, drawn first so the cap sits over it ---- */}
      <rect x="89" y="54" width="22" height="30" fill="currentColor" fillOpacity="0.04" />
      <line x1="89" y1="54" x2="89" y2="84" stroke="currentColor" strokeOpacity="0.2" />
      <line x1="111" y1="54" x2="111" y2="84" stroke="currentColor" strokeOpacity="0.2" />

      {/* ---- cap: wide, low, flat ---- */}
      <rect x={capX} y="14" width={capW} height="48" rx="1.5" fill={tone} fillOpacity="0.92" />
      <rect x={capX} y="14" width={capW * 0.2} height="48" fill="#ffffff" fillOpacity="0.1" />
      <rect
        x={capX}
        y="14"
        width={capW}
        height="48"
        rx="1.5"
        stroke="currentColor"
        strokeOpacity="0.2"
      />
      {/* collar */}
      <rect x={capX + 4} y="62" width={capW - 8} height="5" fill="currentColor" fillOpacity="0.12" />

      {/* ---- body ---- */}
      <g clipPath={`url(#${clip})`}>
        <rect x={bx} y={by} width={bw} height={bh} fill="currentColor" fillOpacity="0.015" />
        <rect x={bx} y={fillTop} width={bw} height={by + bh - fillTop} fill={`url(#${liquid})`} />
        {/* meniscus */}
        <rect x={bx} y={fillTop} width={bw} height="1.25" fill="#ffffff" fillOpacity="0.28" />
        <rect x={bx} y={by} width={bw} height={bh} fill={`url(#${glass})`} />
        {/* a single specular band, the only highlight on the glass */}
        <rect x={bx + bw * 0.12} y={by + 10} width="7" height={bh - 26} fill="#ffffff" fillOpacity="0.14" />
      </g>
      <rect
        x={bx}
        y={by}
        width={bw}
        height={bh}
        rx={bodyR}
        stroke="currentColor"
        strokeOpacity="0.26"
      />
      {/* shoulder line */}
      <line
        x1={bx}
        y1={by + 9}
        x2={bx + bw}
        y2={by + 9}
        stroke="currentColor"
        strokeOpacity="0.1"
      />

      {/* ---- etched label ---- */}
      <rect
        x={labelX}
        y="212"
        width={labelW}
        height="94"
        fill="#ffffff"
        fillOpacity="0.05"
        stroke="currentColor"
        strokeOpacity="0.32"
      />
      <text
        x="100"
        y="252"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.78"
        style={{ fontFamily: "var(--font-cormorant), serif", fontSize: 29, fontWeight: 300 }}
      >
        ami
      </text>
      <line x1="84" y1="266" x2="116" y2="266" stroke="currentColor" strokeOpacity="0.26" />
      <text
        x="100"
        y="288"
        textAnchor="middle"
        fill="currentColor"
        fillOpacity="0.58"
        style={{
          fontFamily: "var(--font-jost), sans-serif",
          fontSize: 9.5,
          letterSpacing: "0.3em",
        }}
      >
        {mark}
      </text>
    </svg>
  );
}
