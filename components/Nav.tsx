"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { useExperience } from "./Experience";
import { Magnetic } from "./Magnetic";

const LINKS = [
  { label: "Shop", href: "#signature" },
  { label: "Collection", href: "#collection" },
  { label: "Our House", href: "#house" },
];

export function Nav() {
  const { revealed, scrollTo } = useExperience();
  const navRef = useRef<HTMLElement>(null);
  const [solid, setSolid] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [bag] = useState(0);

  // Intro: the chrome arrives after the footage, never before it.
  useEffect(() => {
    if (!revealed || !navRef.current) return;
    const items = navRef.current.querySelectorAll("[data-nav-item]");
    gsap.fromTo(
      items,
      { opacity: 0, y: -12 },
      {
        opacity: 1,
        y: 0,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.07,
        delay: 0.5,
      }
    );
  }, [revealed]);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that is open must not let the page drift behind it.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const go = (href: string) => {
    const wasOpen = menuOpen;
    setMenuOpen(false);

    const run = () => {
      // "#collection" lives inside the film's pinned viewport, so its offset is
      // wherever the sticky element happens to be sitting. The real destination
      // is a position along the film's scroll, not the element itself.
      if (href === "#collection") {
        const film = document.getElementById("film");
        if (film) {
          scrollTo(film.offsetTop + (film.offsetHeight - window.innerHeight) * 0.74);
          return;
        }
      }
      scrollTo(href, -1);
    };

    window.setTimeout(run, wasOpen ? 380 : 0);
  };

  return (
    <>
      <header
        ref={navRef}
        className={[
          "fixed inset-x-0 top-0 z-[60] transition-[background-color,backdrop-filter,border-color,padding] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
          solid
            ? "border-b border-ivory/10 bg-ink/55 py-4 backdrop-blur-xl md:py-5"
            : "border-b border-transparent py-6 md:py-8",
        ].join(" ")}
      >
        <nav
          aria-label="Primary"
          className="mx-auto flex w-full max-w-[112rem] items-center justify-between px-6 md:px-10 lg:px-14"
        >
          <a
            data-nav-item
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollTo(0);
            }}
            className="font-display text-[1.75rem] leading-none font-light tracking-[-0.02em] text-ivory md:text-[2rem]"
          >
            ami
          </a>

          <ul className="hidden items-center gap-10 md:flex lg:gap-14">
            {LINKS.map((link) => (
              <li key={link.label} data-nav-item>
                <a
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    go(link.href);
                  }}
                  className="label group relative text-ivory/70 transition-colors duration-500 hover:text-ivory"
                >
                  {link.label}
                  <span className="absolute -bottom-2 left-0 h-px w-0 bg-ivory/60 transition-[width] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-6 md:gap-9">
            <button
              data-nav-item
              type="button"
              className="label hidden text-ivory/70 transition-colors duration-500 hover:text-ivory md:inline-block"
            >
              Search
            </button>
            <button
              data-nav-item
              type="button"
              className="label text-ivory/70 transition-colors duration-500 hover:text-ivory"
            >
              Bag<span className="ml-1.5 tabular-nums opacity-60">({bag})</span>
            </button>
            <button
              data-nav-item
              type="button"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((v) => !v)}
              className="relative flex h-5 w-6 flex-col justify-center gap-[5px] md:hidden"
            >
              <span
                className={[
                  "block h-px w-full bg-ivory transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  menuOpen ? "translate-y-[3px] rotate-45" : "",
                ].join(" ")}
              />
              <span
                className={[
                  "block h-px w-full bg-ivory transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  menuOpen ? "-translate-y-[3px] -rotate-45" : "",
                ].join(" ")}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu — a quiet full-height panel, not a dropdown. */}
      <div
        className={[
          "fixed inset-0 z-50 flex flex-col justify-center bg-ink/95 backdrop-blur-2xl transition-opacity duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] md:hidden",
          menuOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <ul className="flex flex-col gap-2 px-8">
          {LINKS.map((link, i) => (
            <li
              key={link.label}
              style={{ transitionDelay: menuOpen ? `${120 + i * 70}ms` : "0ms" }}
              className={[
                "transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]",
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              ].join(" ")}
            >
              <a
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  go(link.href);
                }}
                className="font-display block border-b border-ivory/10 py-5 text-5xl font-light text-ivory"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="mt-12 flex gap-8 px-8">
          <Magnetic>
            <button type="button" className="label text-ivory/60">
              Search
            </button>
          </Magnetic>
          <Magnetic>
            <button type="button" className="label text-ivory/60">
              Instagram
            </button>
          </Magnetic>
        </div>
      </div>
    </>
  );
}
