import Image from "next/image";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { FEATURE_IMAGES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

/**
 * Real illustration lookup (server-side): if `public/images/features/<name>.(png|jpg|jpeg|webp)`
 * exists it is used automatically; otherwise the CSS mockup renders. Explicit paths in
 * FEATURE_IMAGES always win.
 */
function featureImage(name: "devices" | "download" | "kids"): string | null {
  const explicit = FEATURE_IMAGES[name];
  if (explicit) return explicit;
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const rel = `/images/features/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return rel;
  }
  return null;
}

const DEV = [1, 2, 3, 4].map((n) => `/images/backgrounds/devices/device${n}.jpg`);
const KIDS = [1, 2, 3].map((n) => `/images/backgrounds/kids/kid${n}.jpg`);
const EXTRA = [
  "/images/backgrounds/posters/poster1.jpg",
  "/images/backgrounds/posters/poster2.jpg",
  "/images/backgrounds/posters/poster3.jpg",
  "/images/backgrounds/posters/poster4.jpg",
  "/images/backgrounds/object1.png",
];

/* ------------------------------------------------------------------ */
/* tiny WeShort app UI pieces (rendered inside device screens)         */
/* ------------------------------------------------------------------ */

function Poster({ src, className = "", sizes = "120px" }: { src: string; className?: string; sizes?: string }) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <Image src={src} alt="" fill sizes={sizes} className="object-cover" />
    </span>
  );
}

function WsLogo({ className = "h-2.5" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <svg viewBox="0 0 48 34" className="h-full w-auto" fill="none" stroke="#e50914" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5 L15 29 L26 5" />
        <path d="M22 5 L33 29 L44 5" />
      </svg>
      <span className="text-[0.55em] font-bold leading-none text-white">WeShort</span>
    </span>
  );
}

/** Web navbar: logo · Categories · MyShorts · search · Gift Card · Dashboard */
function WsNav({ scale = 1 }: { scale?: number }) {
  return (
    <div className="flex items-center gap-2 whitespace-nowrap px-2.5 py-1.5 [&>*]:shrink-0" style={{ fontSize: `${8 * scale}px` }}>
      <WsLogo className="h-[1.1em]" />
      <span className="ml-1 text-white/85">Categories ▾</span>
      <span className="text-white/85">MyShorts</span>
      <span className="flex items-center gap-1 text-white/50">
        <svg viewBox="0 0 24 24" className="h-[1em] w-[1em]" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        <span className="border-b border-white/30 pr-6">Search</span>
      </span>
      <span className="ml-auto text-white/85">Gift Card</span>
      <span className="rounded-[2px] bg-brand px-1.5 py-[2px] font-semibold text-white">Dashboard</span>
    </div>
  );
}

/** Hero block: big still + title / meta / description */
function WsHero({ src, title, meta, text, scale = 1 }: { src: string; title: string; meta: string; text: string; scale?: number }) {
  return (
    <div className="relative flex-1 overflow-hidden">
      <Image src={src} alt="" fill sizes="600px" className="object-cover object-top" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2" style={{ fontSize: `${8 * scale}px` }}>
        <p className="text-[2.2em] font-black uppercase leading-none tracking-tight">{title}</p>
        <p className="mt-1 text-[0.95em] font-semibold text-white/85">{meta}</p>
        <p className="mt-1 max-w-[70%] text-[0.9em] leading-snug text-white/70">{text}</p>
      </div>
    </div>
  );
}

/** Poster row with heading + "Browse all" */
function WsRow({ label, items, scale = 1 }: { label: string; items: string[]; scale?: number }) {
  return (
    <div className="px-2.5 pt-1.5" style={{ fontSize: `${8 * scale}px` }}>
      <p className="mb-1 font-bold">
        {label} <span className="ml-1 font-normal text-white/50">Browse all ›</span>
      </p>
      <div className="grid grid-cols-5 gap-1">
        {items.map((s, i) => (
          <span key={i} className="relative aspect-[3/4] overflow-hidden rounded-[2px]">
            <Image src={s} alt="" fill sizes="80px" className="object-cover" />
            <span className="absolute right-0.5 top-0.5 rounded-[2px] bg-black/70 px-0.5 text-[0.7em] text-white/90">{12 + i * 3}&apos;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/** Mobile app screen: status bar, logo, "New Releases" 2×2 grid, bottom nav */
function WsPhoneScreen({ items, scale = 1 }: { items: string[]; scale?: number }) {
  return (
    <div className="flex h-full flex-col bg-[#05132c]" style={{ fontSize: `${7 * scale}px` }}>
      {/* status bar spacer (under the dynamic island) */}
      <div className="h-[6%]" />
      <div className="flex items-center justify-between px-2">
        <WsLogo className="h-[1.2em]" />
        <span className="flex gap-1.5 text-white/80">
          <svg viewBox="0 0 24 24" className="h-[1.2em] w-[1.2em]" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8" /></svg>
          <svg viewBox="0 0 24 24" className="h-[1.2em] w-[1.2em]" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
        </span>
      </div>
      <p className="mt-2 truncate whitespace-nowrap px-2 font-bold">
        New Releases 4Free <span className="text-white/50">›</span>
      </p>
      <div className="mt-1 grid flex-1 grid-cols-2 gap-1.5 px-2">
        {items.slice(0, 4).map((s, i) => (
          <span key={i} className="relative overflow-hidden rounded-[3px]">
            <Image src={s} alt="" fill sizes="80px" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1 pb-1 pt-3 text-[0.8em] font-semibold uppercase leading-none">
              {["The Hole", "Be Gay Tomorrow", "La Slitta", "Des Hommes"][i]}
            </span>
          </span>
        ))}
      </div>
      {/* bottom nav */}
      <div className="flex items-center justify-around px-3 pb-[10%] pt-2 text-white/75">
        <svg viewBox="0 0 24 24" className="h-[1.3em] w-[1.3em] text-brand" fill="currentColor"><path d="M8 5l11 7-11 7z" /></svg>
        <svg viewBox="0 0 24 24" className="h-[1.3em] w-[1.3em]" fill="currentColor"><path d="M12 21s-7-4.4-9.3-8.6C.9 9 2.6 5 6.5 5c2 0 3.5 1 4.5 2.4C12 6 13.5 5 15.5 5 19.4 5 21.1 9 20.3 12.4 18 16.6 12 21 12 21z" /></svg>
        <svg viewBox="0 0 24 24" className="h-[1.3em] w-[1.3em]" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.2-6 8-6s7 2 8 6z" /></svg>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* device frames                                                        */
/* ------------------------------------------------------------------ */

const bezel = "bg-[linear-gradient(135deg,#2a2f3a,#0b0d12_45%,#1c2029)] shadow-[0_30px_70px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.25)]";

function TvFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className={`rounded-md p-[5px] ${bezel}`}>
        <div className="flex aspect-[16/9] flex-col overflow-hidden rounded-[3px] bg-black">{children}</div>
      </div>
      <div className="mx-auto h-4 w-[6%] bg-gradient-to-b from-[#1c2029] to-[#0b0d12]" />
      <div className="mx-auto h-1.5 w-[34%] rounded-full bg-gradient-to-r from-transparent via-[#3a4150] to-transparent" />
    </div>
  );
}

function LaptopFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className={`rounded-t-lg p-[4px] pb-0 ${bezel}`}>
        <div className="flex aspect-[16/10] flex-col overflow-hidden rounded-t-[4px] bg-black">{children}</div>
      </div>
      <div className="h-2.5 rounded-b-md bg-[linear-gradient(to_bottom,#8b93a1,#3a4150)] shadow-[0_10px_20px_rgba(0,0,0,0.6)]">
        <div className="mx-auto h-1 w-[16%] rounded-b bg-[#111318]" />
      </div>
    </div>
  );
}

function TabletFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className={`rounded-xl p-[5px] ${bezel}`}>
        <div className="flex aspect-[4/3] flex-col overflow-hidden rounded-lg bg-black">{children}</div>
      </div>
    </div>
  );
}

/** iPhone-style frame: titanium edge, side buttons, dynamic island, home indicator. */
function PhoneFrame({ children, className = "", style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={className} style={style}>
      <div className="relative">
      {/* side buttons */}
      <span aria-hidden className="absolute -left-[2px] top-[18%] h-[4%] w-[2px] rounded-l-sm bg-[#8b919c]" />
      <span aria-hidden className="absolute -left-[2px] top-[25%] h-[7%] w-[2px] rounded-l-sm bg-[#8b919c]" />
      <span aria-hidden className="absolute -left-[2px] top-[34%] h-[7%] w-[2px] rounded-l-sm bg-[#8b919c]" />
      <span aria-hidden className="absolute -right-[2px] top-[27%] h-[10%] w-[2px] rounded-r-sm bg-[#8b919c]" />

      {/* titanium frame */}
      <div className="rounded-[18%/8.5%] bg-[linear-gradient(135deg,#a3a9b4_0%,#4b515c_30%,#1c2029_60%,#8b919c_100%)] p-[2px] shadow-[0_35px_70px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.35)]">
        {/* black bezel */}
        <div className="rounded-[17%/8%] bg-black p-[3px]">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[15%/7%] bg-black">
            {children}
            {/* dynamic island */}
            <span className="absolute left-1/2 top-[1.6%] z-20 h-[3.2%] w-[30%] -translate-x-1/2 rounded-full bg-black ring-1 ring-white/5" />
            {/* home indicator */}
            <span className="absolute bottom-[1.4%] left-1/2 z-20 h-[0.6%] w-[34%] -translate-x-1/2 rounded-full bg-white/70" />
            {/* glare */}
            <span className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(115deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.04)_28%,transparent_45%)]" />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* scenes                                                              */
/* ------------------------------------------------------------------ */

/** White-bezel tablet (like the reference iPad). */
function WhiteTabletFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="rounded-[9px] bg-[linear-gradient(135deg,#9aa1ad,#6b7280_50%,#4b5261)] p-[3px] shadow-[0_30px_60px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-black/30">
        <div className="flex aspect-[16/10] flex-col overflow-hidden rounded-[6px] bg-black">{children}</div>
      </div>
    </div>
  );
}

/**
 * All-devices — replica of the WeShort device family shot:
 * big TV back-centre with stand, laptop front-right, white tablet front-left, phone front-centre.
 * (Set FEATURE_IMAGES.devices in constants.ts to use a real render instead.)
 */
function DevicesMock() {
  return (
    <div className="relative mx-auto aspect-[1570/640] w-full max-w-4xl select-none lg:scale-[1.08] lg:origin-left">
      {/* TV — back centre */}
      <div className="absolute left-[24%] top-[6%] w-[50%]">
        <div className="rounded-[4px] bg-[#0b0d12] p-[4px] shadow-[0_40px_80px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <div className="flex aspect-[16/9] flex-col overflow-hidden rounded-[2px] bg-black">
            <WsNav scale={1.05} />
            <WsHero
              src={DEV[3]}
              title="Skin"
              meta="2018 · UNITED STATES · R"
              text="In a small supermarket in rural America, a man smiles at a boy across the aisle. That harmless moment will spark a war between gangs."
              scale={1.05}
            />
          </div>
        </div>
        {/* neck + foot */}
        <div className="mx-auto h-[14px] w-[9%] bg-[linear-gradient(to_bottom,#1c2029,#0b0d12)]" />
        <div className="mx-auto h-[6px] w-[36%] rounded-[3px] bg-[linear-gradient(90deg,#1c2029,#3a4150,#1c2029)] shadow-[0_10px_20px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Laptop — front right */}
      <div className="absolute left-[59%] top-[34%] w-[38%]">
        <div className="rounded-t-[8px] bg-[#0f1218] p-[5px] pb-0 shadow-[0_35px_70px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <div className="flex aspect-[16/10] flex-col overflow-hidden rounded-t-[3px] bg-black">
            <WsNav scale={0.8} />
            <WsRow label="Nuove Uscite 4Free" items={[DEV[0], DEV[1], DEV[2], EXTRA[0], EXTRA[1]]} scale={0.8} />
            <WsRow label="Oscars®" items={[EXTRA[2], EXTRA[3], DEV[3], EXTRA[4], DEV[0]]} scale={0.8} />
          </div>
        </div>
        {/* base */}
        <div className="-mx-[4%] h-[9px] rounded-b-[8px] bg-[linear-gradient(to_bottom,#3a4150,#1c2029)] shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
          <div className="mx-auto h-[3px] w-[14%] rounded-b-[3px] bg-[#0b0d12]" />
        </div>
      </div>

      {/* Tablet — front left, white bezel */}
      <WhiteTabletFrame className="absolute left-[9%] top-[42%] w-[25%]">
        <WsNav scale={0.55} />
        <WsHero src={DEV[1]} title="How to be alone" meta="2017 · UNITED STATES · R" text="Dark and mischievously funny." scale={0.62} />
      </WhiteTabletFrame>

      {/* Phone — front centre */}
      <PhoneFrame className="absolute left-[27.5%] top-[52%] w-[8%] drop-shadow-[0_25px_40px_rgba(0,0,0,0.75)]">
        <WsPhoneScreen items={[EXTRA[0], DEV[2], EXTRA[3], DEV[0]]} scale={0.6} />
      </PhoneFrame>
    </div>
  );
}

/** Upright phone (poster) + premium download card overlapping its lower half. */
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

      {/* futuristic HUD download panel */}
      <div className="absolute bottom-[6%] left-1/2 w-[94%] -translate-x-1/2">
        <div className="animate-float-slow relative" style={{ animationDelay: "0.6s" }}>
          {/* neon gradient border (mask trick) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl bg-[linear-gradient(120deg,rgba(56,189,248,0.9),rgba(56,189,248,0.1)_35%,rgba(229,9,20,0.15)_65%,rgba(56,189,248,0.8))] opacity-80 [mask:linear-gradient(#000_0_0)_content-box,linear-gradient(#000_0_0)] [mask-composite:exclude] p-px"
          />
          <div className="relative overflow-hidden rounded-2xl bg-[#040f26]/90 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            {/* faint grid + scanline glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.6)_1px,transparent_1px)] [background-size:22px_22px]" />
            <div aria-hidden className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
            {/* HUD corner brackets */}
            {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "left-2 bottom-2 border-l border-b", "right-2 bottom-2 border-r border-b"].map((c) => (
              <span key={c} aria-hidden className={`pointer-events-none absolute h-3 w-3 border-sky-300/70 ${c}`} />
            ))}

            <div className="relative flex items-center gap-4">
              {/* progress ring around the poster */}
              <div className="relative h-20 w-20 shrink-0">
                {/* spinning glow */}
                <span aria-hidden className="animate-spin-slow absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,rgba(56,189,248,0.7)_20%,transparent_40%)] blur-md" />
                {/* ring: 68% */}
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{ background: "conic-gradient(#38bdf8 0 68%, rgba(255,255,255,0.12) 68% 100%)" }}
                />
                <span aria-hidden className="absolute inset-[3px] rounded-full bg-[#040f26]" />
                <span className="absolute inset-[6px] overflow-hidden rounded-full ring-1 ring-white/15">
                  <Image src={DEV[1]} alt="" fill sizes="80px" className="object-cover object-top" />
                </span>
                {/* percent badge */}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-sky-400 px-1.5 py-[1px] text-[10px] font-bold text-[#04122c] shadow-[0_0_14px_rgba(56,189,248,0.9)]">
                  68%
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300">
                  <span className="animate-blink h-1.5 w-1.5 rounded-full bg-sky-300 shadow-[0_0_8px_rgba(56,189,248,1)]" />
                  Downloading
                </div>
                <p className="mt-1 truncate text-lg font-bold leading-tight">Fight Club</p>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-white/55">
                  <span>4K · HDR</span>
                  <span>1.2 GB</span>
                  <span className="text-white/80">24 MB/s</span>
                  <span>2 min left</span>
                </div>
                {/* shimmering track */}
                <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div className="relative h-full w-[68%] overflow-hidden rounded-full bg-gradient-to-r from-sky-500 via-sky-400 to-cyan-300 shadow-[0_0_14px_rgba(56,189,248,0.9)]">
                    <span aria-hidden className="animate-shimmer absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent" />
                  </div>
                </div>
              </div>

              {/* pause / action */}
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-300/40 bg-sky-400/10 text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.25)]">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
              </span>
            </div>

            {/* queue */}
            <div className="relative mt-3 flex items-center gap-3 border-t border-white/10 pt-3">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">Queue</span>
              {[
                { src: EXTRA[3], pct: 100, label: "Peaky Blinders", state: "Saved" },
                { src: DEV[2], pct: 32, label: "The Batman", state: "32%" },
              ].map((q) => (
                <span key={q.label} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] py-1 pl-1 pr-2.5">
                  <span className="relative h-7 w-7">
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{ background: `conic-gradient(${q.pct === 100 ? "#34d399" : "#38bdf8"} 0 ${q.pct}%, rgba(255,255,255,0.12) ${q.pct}% 100%)` }}
                    />
                    <span aria-hidden className="absolute inset-[2px] rounded-full bg-[#040f26]" />
                    <span className="absolute inset-[4px] overflow-hidden rounded-full">
                      <Image src={q.src} alt="" fill sizes="30px" className="object-cover object-top" />
                    </span>
                  </span>
                  <span className="text-[11px] leading-tight">
                    <span className="block font-semibold text-white/85">{q.label}</span>
                    <span className={q.pct === 100 ? "text-emerald-300" : "text-sky-300"}>{q.state}</span>
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          <Poster src={p.src} sizes="200px" className="aspect-[2/3] w-full rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/15" />
        </div>
      ))}
      <div className="absolute bottom-[4%] left-1/2 z-30 -translate-x-1/2">
        <div className="animate-float rounded-2xl bg-gradient-to-br from-sky-400 via-blue-600 to-indigo-700 px-8 py-3 shadow-[0_25px_60px_rgba(0,0,0,0.7),inset_0_2px_0_rgba(255,255,255,0.4)] [--rot:-3deg]">
          <span className="bg-gradient-to-b from-yellow-100 to-amber-400 bg-clip-text text-4xl font-black tracking-tight text-transparent drop-shadow sm:text-5xl">
            kids
          </span>
        </div>
      </div>
      {[["12%", "6%"], ["86%", "10%"], ["8%", "70%"], ["90%", "66%"]].map(([l, t], i) => (
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

/** Small red W mark + rule, like the WeShort site headings. */
function Accent() {
  return (
    <div className="mb-5 flex items-center gap-4">
      <svg viewBox="0 0 48 34" className="h-5 w-auto" fill="none" stroke="#e50914" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5 L15 29 L26 5" />
        <path d="M22 5 L33 29 L44 5" />
      </svg>
      <span className="h-px flex-1 bg-white/15" />
    </div>
  );
}

const ROWS = [
  {
    key: "devices",
    title: "Your Entertainment, Anytime, Anywhere: Weshort On All Devices",
    text: "Weshort is compatible with a wide range of devices, so you can watch on the device of your choice. Whether you prefer watching on a big screen or a smaller device, Weshort has you covered.",
    link: { label: "View Device List", href: "#" },
    image: featureImage("devices"),
    mock: <DevicesMock />,
    reverse: false,
    wide: true,
  },
  {
    key: "download",
    title: "Download Now, Watch Later: Weshort For On-The-Go Viewing",
    text: "With Weshort, cinema becomes pocket-friendly — the most beautiful short films always at your fingertips. On your lunch break, on the train, before going to sleep: download now and watch later, on your own terms.",
    image: featureImage("download"),
    mock: <DownloadMock />,
    reverse: true,
    wide: false,
  },
  {
    key: "kids",
    title: "Parental Controls: Keeping Your Kids Safe On Weshort",
    text: "With parental controls, you can give your children the freedom to explore, while still keeping them safe from inappropriate content.",
    image: featureImage("kids"),
    mock: <KidsMock />,
    reverse: false,
    wide: false,
  },
] as const;

/** All three feature rows in one grouped section. */
export default function Features() {
  return (
    <section id="features" className="px-6 py-8 sm:px-12 sm:py-10">
      <div className="mx-auto max-w-6xl space-y-16 sm:space-y-20">
        {ROWS.map((row) => (
          <div
            key={row.key}
            className={`grid items-center gap-10 lg:gap-14 ${
              row.wide ? "lg:grid-cols-[2.2fr_1fr]" : "lg:grid-cols-2"
            } ${row.reverse ? "lg:[&>*:first-child]:order-2" : ""}`}
          >
            <Reveal from={row.reverse ? "right" : "left"} distance={40} scale>
              {row.image ? (
                <div className={`relative mx-auto w-full ${row.wide ? "aspect-[1570/640] max-w-4xl" : "aspect-[4/3] max-w-md"}`}>
                  <Image
                    src={row.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 90vw, 800px"
                    className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                  />
                </div>
              ) : (
                row.mock
              )}
            </Reveal>

            <Reveal from={row.reverse ? "left" : "right"} delay={120} className={row.reverse ? "lg:pr-6" : "lg:pl-6"}>
              <Accent />
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
