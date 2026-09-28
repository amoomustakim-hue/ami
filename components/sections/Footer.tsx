"use client";

import { useExperience } from "../Experience";
import { useReveal } from "@/lib/useReveal";

const LINKS = [
  { label: "Instagram", href: "#" },
  { label: "Contact", href: "#" },
  { label: "Shipping", href: "#" },
  { label: "Privacy", href: "#" },
  { label: "Terms", href: "#" },
];

export function Footer() {
  const { revealed } = useExperience();
  const ref = useReveal<HTMLElement>({ enabled: revealed, start: "top 90%" });

  return (
    <footer ref={ref} className="relative z-10 bg-ink text-ivory">
      <div className="mx-auto w-full max-w-[112rem] px-6 pt-24 pb-14 md:px-10 md:pt-32 md:pb-16 lg:px-14">
        <div className="flex flex-col gap-16 border-b border-ivory/12 pb-16 md:flex-row md:items-start md:justify-between md:gap-10">
          <div data-reveal>
            <span className="font-display block text-[clamp(3.5rem,10vw,7rem)] leading-[0.85] font-light tracking-[-0.02em]">
              ami
            </span>
            <span className="label mt-6 block text-ivory/45">The Art of Scent</span>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-4 md:items-end md:gap-5">
              {LINKS.map((link, i) => (
                <li key={link.label} data-reveal data-reveal-delay={`${i * 0.05}`}>
                  <a
                    href={link.href}
                    className="label group relative inline-block text-ivory/60 transition-colors duration-500 hover:text-ivory"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-ivory/50 transition-[width] duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:w-full" />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <span className="label label-tight text-ivory/30">
            &copy; {new Date().getFullYear()} ami
          </span>
          <span className="label label-tight text-ivory/30">
            Composed &amp; bottled in small batches
          </span>
        </div>
      </div>
    </footer>
  );
}
