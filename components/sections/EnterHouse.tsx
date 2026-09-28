"use client";

/** Beat 2 — the threshold. Copy is deliberately sparse; the doors are the event. */
export function EnterHouse() {
  return (
    <>
      <div
        data-film="enter-label"
        className="absolute inset-x-0 top-[26vh] flex justify-center px-6 opacity-0 md:top-[24vh]"
      >
        <span className="label border border-ivory/20 px-5 py-2.5 text-ivory/75 backdrop-blur-sm">
          Step Inside
        </span>
      </div>

      <div
        data-film="enter"
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center opacity-0"
      >
        <h2 className="font-display display-md font-light text-ivory">
          Welcome to ami.
        </h2>
        <p className="measure mt-7 text-[0.95rem] leading-[1.75] font-light text-balance text-ivory/65 md:text-base">
          Discover fragrances designed to become part of your story.
        </p>
      </div>
    </>
  );
}
