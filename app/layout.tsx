import { Fragment } from "react";
import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import "./globals.css";
import { PRIORITY_FRAMES } from "@/lib/frames";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  // Only the light roman and its italic are ever used; the other six faces
  // were 200KB of pure dead weight on the critical path.
  weight: ["300"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ami.house"),
  title: {
    default: "ami — The Art of Scent",
    template: "%s · ami",
  },
  description:
    "An intimate world of scent, crafted for those who leave an impression. Step inside the ami house of fragrance.",
  openGraph: {
    title: "ami — The Art of Scent",
    description:
      "An intimate world of scent, crafted for those who leave an impression.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#17150f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        {/*
          Preload the whole priority batch, not just the opening frame.

          The loader only retires once these are decoded, but the fetch for them
          lives in a client effect — so without this they cannot start until
          React has hydrated. On a local server that boot is ~100ms and invisible;
          over a real network it was costing three seconds of dead time before a
          single frame was even requested. Declaring them here lets them stream
          alongside the JS bundle instead of queueing behind it.

          `media` keeps each viewport to its own ladder, so nobody pays twice.

          Do NOT add fetchPriority="high" here. It puts these ahead of the
          render-blocking stylesheet and pushes the loader's own first paint
          from ~0.8s out to ~2.2s. They need to start early, not first.
        */}
        {Array.from({ length: PRIORITY_FRAMES }, (_, i) => {
          const file = `${String(i + 1).padStart(4, "0")}.webp`;
          return (
            <Fragment key={file}>
              <link
                rel="preload"
                as="image"
                href={`/frames/desktop/${file}`}
                type="image/webp"
                media="(min-width: 768px)"
              />
              <link
                rel="preload"
                as="image"
                href={`/frames/mobile/${file}`}
                type="image/webp"
                media="(max-width: 767px)"
              />
            </Fragment>
          );
        })}
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
