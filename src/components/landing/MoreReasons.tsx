import Reveal from "@/components/ui/Reveal";

/** Red line icons sitting in white discs. */
const ICONS = {
  tv: (
    <>
      <rect x="3" y="5" width="18" height="12" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M17.5 2.5a5.5 5.5 0 0 1 0 0" />
    </>
  ),
  download: (
    <>
      <path d="M7 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h2" />
      <path d="M17 4h2a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-2" />
      <path d="M12 7v9M8.5 12.5 12 16l3.5-3.5" />
    </>
  ),
  star: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <path d="m7.4 8.6 1 1.9 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.4-1.4 2-.3z" />
      <path d="m16.6 8.6 1 1.9 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2-1.4-1.4 2-.3z" />
      <path d="M8.5 16.2c1 1 2.2 1.5 3.5 1.5s2.5-.5 3.5-1.5" />
    </>
  ),
  kids: (
    <>
      <circle cx="7.5" cy="6.5" r="2.4" />
      <path d="M3.6 13.4a4 4 0 0 1 7.8 0" />
      <circle cx="16.5" cy="6.5" r="2.4" />
      <path d="M12.6 13.4a4 4 0 0 1 7.8 0" />
      <path d="M4 20h16" />
      <path d="M8 17v3M16 17v3" />
    </>
  ),
};

const REASONS: { icon: keyof typeof ICONS; title: string; body: string }[] = [
  {
    icon: "tv",
    title: "Enjoy on your own home TV setup",
    body: "Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.",
  },
  {
    icon: "download",
    title: "Download shows for offline viewing",
    body: "Save your favourites easily and always have something exciting ready to watch.",
  },
  {
    icon: "star",
    title: "Watch everywhere on any device, anytime",
    body: "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.",
  },
  {
    icon: "kids",
    title: "Create separate profiles for kids",
    body: "Send kids on adventures with their favourite characters in a space made just for them.",
  },
];

/** "More Reasons to Join" — four benefits under a deep red glow. */
export default function MoreReasons() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden bg-[#050506] px-6 py-16 sm:px-12 sm:py-20">
      {/* The light comes from the left EDGE, not a corner: a red band running the
          full height, fading out to the right, with the top-left burning hottest.
          The whole group is masked top and bottom so it eases in and out of the
          neighbouring screens instead of starting hard at the section boundary. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 9%, #000 22%, #000 84%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.45) 9%, #000 22%, #000 84%, transparent 100%)",
        }}
      >
        <span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(150,11,21,0.66) 0%, rgba(122,9,18,0.44) 9%, rgba(84,6,14,0.26) 19%, rgba(44,4,9,0.12) 32%, transparent 48%)",
          }}
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(44% 62% at 0% 6%, rgba(196,16,30,0.58) 0%, rgba(120,10,20,0.26) 42%, transparent 74%)",
          }}
        />
        <span
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(34% 40% at 0% 100%, rgba(132,9,20,0.34) 0%, transparent 68%)",
          }}
        />
      </span>

      {/* soft joins with the screens above and below */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black via-black/55 to-transparent"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black to-transparent"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal>
          <h2 data-fx="words" className="max-w-lg text-[2.6rem] font-bold leading-[1.1] tracking-tight sm:text-[3.2rem]">
            More Reasons to Join
          </h2>
        </Reveal>

        <div data-fx="stagger" className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={i * 110} distance={30}>
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-[0_10px_28px_-12px_rgba(0,0,0,0.9)]">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8 text-brand"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {ICONS[r.icon]}
                </svg>
              </span>

              <h3 className="mt-6 max-w-[16rem] text-[19px] font-bold leading-snug tracking-tight">
                {r.title}
              </h3>
              <p className="mt-3 max-w-[16rem] text-[14.5px] leading-relaxed text-white/50">
                {r.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
