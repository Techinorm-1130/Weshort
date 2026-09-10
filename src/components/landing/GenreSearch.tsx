import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

/** Red line glyphs that sit inside the white discs on each pill. */
const GLYPHS: Record<string, React.ReactNode> = {
  action: <path d="M13 2 4.5 13H11l-1 9 8.5-11H12z" />,
  scifi: (
    <>
      <path d="M12 3c2.6 2.2 4 5.3 4 8.4 0 2-.5 3.6-1.3 4.9h-5.4C8.5 15 8 13.4 8 11.4 8 8.3 9.4 5.2 12 3Z" />
      <path d="M8.4 13.6 5 16.4l1 3.2 2.6-1.3M15.6 13.6 19 16.4l-1 3.2-2.6-1.3" />
      <circle cx="12" cy="9.5" r="1.6" />
    </>
  ),
  family: (
    <>
      <circle cx="8" cy="7" r="2.3" />
      <circle cx="16" cy="7" r="2.3" />
      <path d="M3.8 18a4.2 4.2 0 0 1 8.4 0M11.8 18a4.2 4.2 0 0 1 8.4 0" />
    </>
  ),
  adventure: (
    <>
      <path d="M2.5 19 9 8l3.5 5.5L15 10l6.5 9z" />
      <circle cx="17.5" cy="5.5" r="2.2" />
    </>
  ),
  comedy: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M8 10.2h.01M16 10.2h.01" />
      <path d="M7.6 14.4c1.1 1.6 2.6 2.4 4.4 2.4s3.3-.8 4.4-2.4z" />
    </>
  ),
  drama: (
    <>
      <path d="M4 4h7v11a3.5 3.5 0 0 1-7 0z" />
      <path d="M13 4h7v8a3.5 3.5 0 0 1-7 0z" />
      <path d="M6.4 8.4h2.2M15.4 8h2.2" />
    </>
  ),
  horror: (
    <>
      <path d="M5 21V10a7 7 0 0 1 14 0v11l-2.3-1.8L14.4 21l-2.4-1.8L9.6 21l-2.3-1.8z" />
      <path d="M9.4 10.5h.01M14.6 10.5h.01" />
    </>
  ),
  thriller: (
    <>
      <path d="M2.2 12S5.8 5.8 12 5.8 21.8 12 21.8 12 18.2 18.2 12 18.2 2.2 12 2.2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  fantasy: (
    <>
      <path d="M4 20 16.5 7.5" />
      <path d="m18.5 3-1 2.6-2.6 1 2.6 1 1 2.6 1-2.6 2.6-1-2.6-1z" />
      <path d="M6.5 4.5 7 6l1.5.5L7 7l-.5 1.5L6 7l-1.5-.5L6 6z" />
    </>
  ),
  mystery: (
    <>
      <circle cx="10.5" cy="10.5" r="6.3" />
      <path d="m15.2 15.2 5 5" />
      <path d="M9 9.2a1.6 1.6 0 1 1 2.3 1.4c-.5.3-.8.7-.8 1.3" />
    </>
  ),
  crime: (
    <>
      <path d="M12 2.6a6 6 0 0 1 6 6c0 4.6-1 8.2-2.4 11.4" />
      <path d="M12 6.2a2.8 2.8 0 0 1 2.8 2.8c0 3.9-.7 7-1.9 9.8" />
      <path d="M6 9a6 6 0 0 1 1.9-4.4M6.2 17.4A20 20 0 0 0 8.8 9a3.2 3.2 0 0 1 1.4-2.6" />
    </>
  ),
  romance: (
    <path d="M12 20.4S3.8 15.2 3.8 9.5A4.3 4.3 0 0 1 12 7.4a4.3 4.3 0 0 1 8.2 2.1c0 5.7-8.2 10.9-8.2 10.9Z" />
  ),
  biographical: (
    <>
      <path d="M4 4.5h6a3 3 0 0 1 3 3V20a2.4 2.4 0 0 0-2.4-2.4H4z" />
      <path d="M20 4.5h-4" />
      <circle cx="17.5" cy="10.5" r="2.1" />
      <path d="M14.4 18a3.4 3.4 0 0 1 6.2 0" />
    </>
  ),
  war: (
    <>
      <path d="M12 2.6 4.5 5.4v6c0 4.5 3.1 8.4 7.5 10 4.4-1.6 7.5-5.5 7.5-10v-6z" />
      <path d="M9.2 12.2 11.3 14l4-4.4" />
    </>
  ),
  western: (
    <>
      <path d="M7.4 12c-.4-2.6-.6-4.8-.5-6.6.1-1.3 1-1.8 2-1.2 1.9 1.1 4.3 1.1 6.2 0 1-.6 1.9-.1 2 1.2.1 1.8-.1 4-.5 6.6" />
      <path d="M2.6 12.6c3 2.4 5.9 3.4 9.4 3.4s6.4-1 9.4-3.4" />
    </>
  ),
  musical: (
    <>
      <path d="M9 18V6.5l10-2V16" />
      <circle cx="6.6" cy="18" r="2.4" />
      <circle cx="16.6" cy="16" r="2.4" />
    </>
  ),
  animation: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="M10 8.6 15.6 12 10 15.4z" />
    </>
  ),
  documentary: (
    <>
      <rect x="2.6" y="7" width="13" height="10" rx="2" />
      <path d="m15.6 12.5 5.8 3.3V8.2l-5.8 3.3z" />
      <circle cx="6.6" cy="12" r="1.6" />
    </>
  ),
};

type Genre = { name: string; glyph: keyof typeof GLYPHS };

/** Three rows of genres; each row loops on its own. */
const ROWS: Genre[][] = [
  [
    { name: "Action", glyph: "action" },
    { name: "Science fiction", glyph: "scifi" },
    { name: "Family", glyph: "family" },
    { name: "Adventure", glyph: "adventure" },
    { name: "Comedy", glyph: "comedy" },
    { name: "Drama", glyph: "drama" },
  ],
  [
    { name: "Horror", glyph: "horror" },
    { name: "Thriller", glyph: "thriller" },
    { name: "Fantasy", glyph: "fantasy" },
    { name: "Mystery", glyph: "mystery" },
    { name: "Crime", glyph: "crime" },
    { name: "Romance", glyph: "romance" },
  ],
  [
    { name: "Biographical", glyph: "biographical" },
    { name: "War", glyph: "war" },
    { name: "Western", glyph: "western" },
    { name: "Musical", glyph: "musical" },
    { name: "Animation", glyph: "animation" },
    { name: "Documentary", glyph: "documentary" },
  ],
];

/**
 * No backdrop-blur on these. Every pill lives inside a track that animates for
 * ever, and a backdrop-filter re-samples what is behind it on each frame — with
 * three rows of them that is what made the section stutter while scrolling. They
 * sit on a flat dark ground, so the blur was buying nothing.
 */
function Pill({ genre }: { genre: Genre }) {
  return (
    <span className="group flex shrink-0 items-center gap-3.5 rounded-full border border-white/10 bg-white/[0.045] py-2 pl-2 pr-7 transition duration-300 hover:border-white/25 hover:bg-white/[0.09]">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)]">
        <svg
          viewBox="0 0 24 24"
          className="h-[22px] w-[22px] text-brand"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {GLYPHS[genre.glyph]}
        </svg>
      </span>
      <span className="whitespace-nowrap text-[16px] font-semibold tracking-tight">
        {genre.name}
      </span>
    </span>
  );
}

/** "Searching by Genre" — three rows of genre pills sliding past each other. */
export default function GenreSearch() {
  return (
    <section
      className="relative flex flex-1 flex-col justify-center overflow-hidden py-14"
      style={{
        background:
          "linear-gradient(to bottom, var(--background) 0%, #03060d 12%, #010203 40%, #010203 62%, #03060d 88%, var(--background) 100%)",
      }}
    >
      {/* deep red light from the right */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, #000 16%, #000 84%, transparent 100%)",
          background:
            "linear-gradient(to left, rgba(146,10,20,0.60) 0%, rgba(112,8,17,0.38) 12%, rgba(66,5,12,0.20) 26%, rgba(30,2,6,0.08) 42%, transparent 60%)",
        }}
      />

      {/* header */}
      {/* flush to the page gutter, not centred in a container — the heading lines
          up with the left edge of the rows below it */}
      <div className="relative z-10 w-full px-6 sm:px-12">
        <div className="grid max-w-5xl items-start gap-7 md:grid-cols-[auto_minmax(0,1fr)] md:gap-14">
          <Reveal>
            <h2 className="text-[2.6rem] font-bold leading-[1.08] tracking-tight sm:text-[3.2rem]">
              Searching by
              <br />
              Genre
            </h2>
          </Reveal>

          {/* pt nudges the first line of copy onto the heading's first line */}
          <Reveal delay={140} className="flex flex-col items-start gap-6 md:pt-3">
            <p className="max-w-[27rem] text-[15px] leading-[1.7] text-white/60">
              When it comes to discovering new content, searching by genre can be a great
              way to find something that fits your preferences.
            </p>
            <Link
              href={ROUTES.signup}
              className="group inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-[14px] font-semibold text-white shadow-[0_14px_34px_-12px_rgba(229,9,20,0.95),inset_0_1px_0_rgba(255,255,255,0.24)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
            >
              Find More
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </Link>
          </Reveal>
        </div>
      </div>

      {/* the rows — full bleed, each sliding the opposite way to its neighbour */}
      <div className="relative z-10 mt-12 flex flex-col gap-4">
        {ROWS.map((row, i) => {
          // One pass has to be at least as wide as the screen, or the loop runs
          // out of pills before it wraps and leaves a gap on the right.
          const strip = [...row, ...row];
          return (
            <div key={i} data-fx="shiftx" data-amount={i % 2 ? -90 : 90} className="flex w-full overflow-hidden">
              {/* no gap on this flex: each pass carries its own trailing space, so
                  the seam between the two passes is exactly one pill gap wide */}
              <div
                className={`flex w-max ${i % 2 ? "animate-genre-right" : "animate-genre-left"}`}
                style={{ animationDuration: `${52 + i * 7}s` }}
              >
                {[0, 1].map((pass) => (
                  <div key={pass} className="flex shrink-0 gap-4 pr-4">
                    {strip.map((g, k) => (
                      <Pill key={`${pass}-${k}-${g.name}`} genre={g} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
