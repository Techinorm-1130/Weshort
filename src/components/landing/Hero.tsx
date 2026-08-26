import Image from "next/image";
import Link from "next/link";
import PosterWall from "@/components/landing/PosterWall";
import { HERO_AVATARS, ROUTES } from "@/lib/constants";

const STATS = [
  { value: "98%", label: "Viewer satisfaction" },
  { value: "100+", label: "New titles weekly" },
  { value: "4K", label: "Highest quality" },
];

/**
 * Landing hero: copy and calls to action on the left, a tilted wall of drifting
 * posters filling the right, everything sitting on black.
 */
export default function Hero() {
  return (
    <section className="font-display relative flex flex-1 items-center overflow-hidden bg-black">
      <PosterWall />

      {/* black falls across the wall from the left so the copy always reads */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#000_0%,#000_28%,rgba(0,0,0,0.92)_44%,rgba(0,0,0,0.55)_62%,rgba(0,0,0,0.25)_100%)] md:bg-[linear-gradient(to_right,#000_0%,#000_30%,rgba(0,0,0,0.9)_44%,rgba(0,0,0,0.5)_60%,rgba(0,0,0,0.14)_80%,transparent_100%)]" />
      {/* a low red glow behind the wall */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(48% 42% at 72% 46%, rgba(229,9,20,0.20) 0%, rgba(229,9,20,0.05) 45%, transparent 72%)",
        }}
      />
      {/* light falling in from the top-right corner, across the wall */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(42% 48% at 96% -4%, rgba(255,214,178,0.34) 0%, rgba(255,138,96,0.16) 28%, rgba(229,9,20,0.08) 48%, transparent 72%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(212deg, rgba(255,235,215,0.16) 0%, rgba(255,150,110,0.07) 14%, transparent 40%)",
        }}
      />
      {/* shade behind the navbar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[16%] bg-gradient-to-b from-black/80 to-transparent" />
      {/* the hero settles into black — the section below picks up from black too */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[26%] bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.35)_38%,rgba(0,0,0,0.8)_72%,#000_100%)]" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-10 pt-28 sm:px-12 sm:pt-32">
        <div className="max-w-2xl">
          {/* social proof */}
          <div
            className="animate-fade-up inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/[0.06] py-1.5 pl-1.5 pr-4 backdrop-blur-md"
            style={{ animationDelay: "60ms" }}
          >
            <span className="flex -space-x-2.5">
              {HERO_AVATARS.map((src, i) => (
                <span
                  key={src}
                  className="relative h-7 w-7 overflow-hidden rounded-full ring-2 ring-black"
                  style={{ zIndex: HERO_AVATARS.length - i }}
                >
                  <Image src={src} alt="" fill sizes="28px" className="object-cover" />
                </span>
              ))}
            </span>
            <span className="text-[12.5px] font-medium text-white/85">
              2M+ <span className="text-white/55">happy members worldwide</span>
            </span>
          </div>

          <h1
            className="animate-fade-up mt-6 text-[2.5rem] font-black leading-[1.04] tracking-[-0.02em] sm:text-[3.35rem] lg:text-[4rem]"
            style={{ animationDelay: "140ms" }}
          >
            Unlimited Movies,
            <br />
            TV Shows, <span className="text-brand">&amp; More</span>
          </h1>

          <p
            className="animate-fade-up mt-5 max-w-xl text-[16.5px] leading-relaxed text-white/65"
            style={{ animationDelay: "260ms" }}
          >
            Award-winning short films, original series and festival premieres — the best of
            world cinema, in your pocket. Starts at €7.99. Cancel anytime.
          </p>

          <div
            className="animate-fade-up mt-7 flex flex-wrap items-center gap-3.5"
            style={{ animationDelay: "380ms" }}
          >
            <Link
              href={ROUTES.signup}
              className="group relative flex items-center gap-2 overflow-hidden rounded-full bg-brand px-6 py-3 text-[13.5px] font-semibold text-white shadow-[0_16px_40px_-14px_rgba(229,9,20,0.95),inset_0_1px_0_rgba(255,255,255,0.25)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
            >
              <span
                aria-hidden
                className="absolute inset-y-0 -left-1/3 w-1/3 -translate-x-[220%] skew-x-[-20deg] bg-white/25 transition-transform duration-[900ms] ease-out group-hover:translate-x-[520%]"
              />
              <span className="relative">30-Day Free Trial</span>
              <svg
                viewBox="0 0 24 24"
                className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>

            <Link
              href={ROUTES.signup}
              className="rounded-full border border-white/20 bg-white/[0.06] px-6 py-3 text-[13.5px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-md transition duration-300 hover:border-white/40 hover:bg-white/[0.12] active:scale-[0.99]"
            >
              Create an Account
            </Link>
          </div>

          {/* stats */}
          <div
            className="animate-fade-up mt-10 flex flex-wrap items-start gap-x-12 gap-y-5"
            style={{ animationDelay: "500ms" }}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <p className="font-display text-[1.8rem] font-black leading-none tracking-tight">
                  {s.value}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-white/40">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
