"use client";

const CATEGORIES = [
  { index: "01", name: "Floral", note: "Neroli · Jasmine · Iris" },
  { index: "02", name: "Woody", note: "Cedar · Vetiver · Papyrus" },
  { index: "03", name: "Amber", note: "Labdanum · Benzoin · Tonka" },
  { index: "04", name: "Fresh", note: "Bergamot · Fig Leaf · Salt" },
  { index: "05", name: "Oud", note: "Agarwood · Saffron · Rose" },
];

/**
 * Beat 3 — standing in the room. The list sits over the footage as a hairline
 * index rather than a grid of cards, so the boutique stays the subject.
 */
export function Collection() {
  return (
    <div
      id="collection"
      data-film="collection"
      className="absolute inset-0 flex flex-col items-center justify-center px-6 opacity-0 md:px-10"
    >
      <h2
        data-film="collection-title"
        className="font-display text-[clamp(2.25rem,7vw,5.5rem)] leading-none font-light tracking-[-0.02em] text-ivory"
      >
        The Collection
      </h2>

      <ul className="mt-10 w-full max-w-xl md:mt-14">
        {CATEGORIES.map((cat) => (
          <li
            key={cat.name}
            data-film="collection-item"
            className="group flex items-baseline justify-between gap-5 border-b border-ivory/12 py-3.5 md:py-4"
          >
            <span className="flex items-baseline gap-4 md:gap-6">
              <span className="label label-tight text-ivory/35 tabular-nums">
                {cat.index}
              </span>
              <span className="font-display text-[clamp(1.5rem,3.6vw,2.5rem)] leading-none font-light text-ivory/90 uppercase">
                {cat.name}
              </span>
            </span>
            <span className="label label-tight hidden text-right text-ivory/40 sm:block">
              {cat.note}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
