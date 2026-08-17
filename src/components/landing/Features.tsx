import Image from "next/image";
import Link from "next/link";
import { FEATURE_IMAGES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

const DEV = [1, 2, 3, 4].map((n) => `/images/backgrounds/devices/device${n}.jpg`);
const KIDS = [1, 2, 3].map((n) => `/images/backgrounds/kids/kid${n}.jpg`);

/* ------------------------------------------------------------------ */
/* small UI helpers                                                    */
/* ------------------------------------------------------------------ */

function Poster({ src, className = "", sizes = "120px" }: { src: string; className?: string; sizes?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
    </span>
  );
}

/** A tiny "streaming app" screen: hero poster + row of thumbnails. */
function AppScreen({ hero, row, label = "Continue Watching" }: { hero: string; row: string[]; label?: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#05132c]">
      <Image src={hero} alt="" fill sizes="420px" className="object-cover object-top" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#05132c] via-[#05132c]/40 to-transparent" />
      <span className="absolute left-2.5 top-2 text-[9px] font-black text-brand">W</span>
      <div className="absolute inset-x-2.5 bottom-2">
        <p className="mb-1 text-[8px] font-semibold text-white/85">{label}</p>
        <div className="flex gap-1">
          {row.map((s) => (
            <Poster key={s} src={s} sizes="40px" className="aspect-[2/3] flex-1 rounded-[3px] ring-1 ring-white/15" />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1) Devices — tight, front-facing cluster                            */
/* ------------------------------------------------------------------ */

function DevicesMock() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md select-none">
      {/* glow */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-[70px]" />

      {/* TV (back) */}
      <div className="absolute left-[10%] top-[6%] w-[80%]">
        <div className="rounded-lg bg-[#0e1420] p-[5px] shadow-[0_30px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <div className="aspect-video overflow-hidden rounded-md">
            <AppScreen hero={DEV[0]} row={DEV} />
          </div>
        </div>
        <div className="mx-auto h-3 w-[8%] bg-[#1a2030]" />
        <div className="mx-auto h-1 w-[36%] rounded-full bg-[#2a3142]" />
      </div>

      {/* Laptop (front-right, overlapping TV) */}
      <div className="absolute bottom-[8%] right-0 w-[54%]">
        <div className="rounded-t-lg bg-[#1a2030] p-[4px] pb-0 shadow-[0_25px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <div className="aspect-[16/10] overflow-hidden rounded-t-md">
            <AppScreen hero={DEV[1]} row={[DEV[2], DEV[3], DEV[0], DEV[1]]} label="Trending Now" />
          </div>
        </div>
        <div className="h-2.5 rounded-b-md bg-gradient-to-b from-[#3a4356] to-[#1a2030] shadow-[0_8px_16px_rgba(0,0,0,0.6)]">
          <div className="mx-auto h-1 w-[16%] rounded-b bg-[#0e1420]" />
        </div>
      </div>

      {/* Tablet (front-left, overlapping TV) */}
      <div className="absolute bottom-[10%] left-0 w-[30%]">
        <div className="rounded-xl bg-[#1a2030] p-[4px] shadow-[0_25px_50px_rgba(0,0,0,0.7)] ring-1 ring-white/10">
          <div className="aspect-[3/4] overflow-hidden rounded-lg">
            <AppScreen hero={DEV[2]} row={[DEV[3], DEV[0], DEV[1]]} label="My List" />
          </div>
        </div>
      </div>

      {/* Phone (front-center, overlapping tablet + laptop) */}
      <div className="absolute bottom-[4%] left-[31%] w-[16%]">
        <div className="rounded-[14px] bg-[#1a2030] p-[3px] shadow-[0_25px_50px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <div className="relative aspect-[9/18] overflow-hidden rounded-[11px]">
            <Poster src={DEV[3]} sizes="90px" className="h-full w-full" />
            <span className="absolute left-1/2 top-1 h-1 w-5 -translate-x-1/2 rounded-full bg-black/80" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2) Download — phone + overlapping download card                     */
/* ------------------------------------------------------------------ */

function DownloadMock() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md select-none">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/15 blur-[70px]" />

      {/* phone */}
      <div className="absolute left-1/2 top-0 w-[46%] -translate-x-1/2">
        <div className="rounded-[2rem] bg-[#0e1420] p-[6px] shadow-[0_40px_80px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <div className="relative aspect-[9/17.5] overflow-hidden rounded-[1.6rem]">
            <Image src={DEV[2]} alt="" fill sizes="220px" className="object-cover object-top" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#05132c]" />
            <span className="absolute left-1/2 top-2.5 h-4 w-[34%] -translate-x-1/2 rounded-full bg-black" />
            <span className="absolute left-4 top-9 text-base font-black text-brand">W</span>
          </div>
        </div>
      </div>

      {/* download card — overlaps the lower half of the phone */}
      <div className="absolute bottom-[10%] left-1/2 w-[92%] -translate-x-1/2">
        <div
          className="animate-float-slow flex items-center gap-4 rounded-2xl border border-white/15 bg-[#0a1a3a] px-4 py-3.5 shadow-[0_30px_70px_rgba(0,0,0,0.75)]"
          style={{ animationDelay: "0.6s" }}
        >
          <Poster src={DEV[1]} sizes="60px" className="h-[4.5rem] w-12 shrink-0 rounded-lg ring-1 ring-white/15" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold leading-tight">Fight Club</p>
            <p className="mt-0.5 text-sm text-sky-400">Downloading…</p>
          </div>
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/25">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
            </svg>
            <span className="absolute inset-0 animate-ping rounded-full border border-sky-400/50" />
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3) Kids — fanned kids posters + kids badge                          */
/* ------------------------------------------------------------------ */

function KidsMock() {
  const fan = [
    { src: KIDS[0], cls: "left-[6%] top-[12%] -rotate-[10deg] z-10" },
    { src: KIDS[2], cls: "right-[6%] top-[12%] rotate-[10deg] z-10" },
    { src: KIDS[1], cls: "left-1/2 top-[4%] -translate-x-1/2 z-20" },
  ];
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md select-none">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/20 blur-[70px]" />

      {fan.map((p) => (
        <div key={p.src} className={`absolute w-[38%] ${p.cls}`}>
          <Poster
            src={p.src}
            sizes="200px"
            className="aspect-[2/3] w-full rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/15"
          />
        </div>
      ))}

      {/* kids badge */}
      <div className="absolute bottom-[4%] left-1/2 z-30 -translate-x-1/2">
        <div
          className="animate-float rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 px-8 py-3 shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.4)] [--rot:-3deg]"
        >
          <span className="bg-gradient-to-b from-yellow-100 to-amber-400 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow sm:text-5xl">
            kids
          </span>
        </div>
      </div>

      {[
        ["12%", "6%"],
        ["86%", "10%"],
        ["8%", "70%"],
        ["90%", "66%"],
      ].map(([l, t], i) => (
        <svg key={i} viewBox="0 0 24 24" className="absolute h-3.5 w-3.5 text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]" style={{ left: l, top: t }} fill="currentColor">
          <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
        </svg>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* section                                                             */
/* ------------------------------------------------------------------ */

const ROWS = [
  {
    key: "devices",
    title: "Your Entertainment, Anytime, Anywhere: Weshort On All Devices",
    text: "Weshort is compatible with a wide range of devices, so you can watch on the device of your choice. Whether you prefer watching on a big screen or a smaller device, Weshort has you covered.",
    link: { label: "View Device List", href: "#" },
    image: FEATURE_IMAGES.devices,
    mock: <DevicesMock />,
    reverse: false,
  },
  {
    key: "download",
    title: "Download Now, Watch Later: Weshort For On-The-Go Viewing",
    text: "With Weshort's download feature, you never have to miss a moment of your favorite shorts and series. Download now and watch later, on your own terms.",
    image: FEATURE_IMAGES.download,
    mock: <DownloadMock />,
    reverse: true,
  },
  {
    key: "kids",
    title: "Parental Controls: Keeping Your Kids Safe On Weshort",
    text: "With parental controls, you can give your children the freedom to explore, while still keeping them safe from inappropriate content.",
    image: FEATURE_IMAGES.kids,
    mock: <KidsMock />,
    reverse: false,
  },
] as const;

export default function Features() {
  return (
    <section className="px-6 py-12 sm:px-12 sm:py-16">
      <div className="mx-auto max-w-6xl space-y-20 sm:space-y-28">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-16 ${row.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            <Reveal from={row.reverse ? "right" : "left"} distance={40} scale>
              {row.image ? (
                <div className="relative mx-auto aspect-[4/3] w-full max-w-md">
                  <Image src={row.image} alt="" fill sizes="(max-width: 1024px) 90vw, 450px" className="object-contain" />
                </div>
              ) : (
                row.mock
              )}
            </Reveal>

            <Reveal from={row.reverse ? "left" : "right"} delay={120} className={row.reverse ? "lg:pr-8" : "lg:pl-8"}>
              <h2 className="text-2xl font-bold leading-snug sm:text-3xl">{row.title}</h2>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">{row.text}</p>
              {"link" in row && row.link ? (
                <Link
                  href={row.link.href}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white hover:underline"
                >
                  {row.link.label}
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              ) : null}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  );
}
