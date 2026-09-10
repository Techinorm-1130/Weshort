import Image from "next/image";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import { FEATURE_IMAGES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

/**
 * Real illustration lookup (server-side): if `public/images/features/devices.(png|jpg|jpeg|webp)`
 * exists it is used automatically; otherwise the CSS mockup renders. An explicit path in
 * FEATURE_IMAGES always wins.
 */
function featureImage(name: "devices"): string | null {
  const explicit = FEATURE_IMAGES[name];
  if (explicit) return explicit;
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const rel = `/images/features/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return rel;
  }
  return null;
}

const DEV = [1, 2, 3, 4].map((n) => `/images/backgrounds/devices/device${n}.jpg`);
const EXTRA = [
  "/images/backgrounds/posters/poster1.jpg",
  "/images/backgrounds/posters/poster2.jpg",
  "/images/backgrounds/posters/poster3.jpg",
  "/images/backgrounds/posters/poster4.jpg",
  "/images/backgrounds/object1.png",
];

/** One slide of the auto-playing hero reel. */
type Slide = { src: string; title: string; meta: string; text: string };

const TV_SLIDES: Slide[] = [
  {
    src: DEV[3],
    title: "Skin",
    meta: "2018 · UNITED STATES · R",
    text: "In a small supermarket in rural America, a man smiles at a boy across the aisle. That harmless moment will spark a war between gangs.",
  },
  {
    src: DEV[0],
    title: "The Hole",
    meta: "2021 · ITALY · 14+",
    text: "A caving expedition drops into the deepest cave in Europe — and into the dark that has been waiting there.",
  },
  {
    src: DEV[2],
    title: "Des Hommes",
    meta: "2020 · FRANCE · R",
    text: "Forty years on, a war they never spoke about comes back for the men who fought it.",
  },
];

const TABLET_SLIDES: Slide[] = [
  { src: DEV[1], title: "How to be alone", meta: "2017 · UNITED STATES · R", text: "Dark and mischievously funny." },
  { src: EXTRA[1], title: "La Slitta", meta: "2019 · ITALY · 7+", text: "A sled, a hill, and one very long winter." },
  { src: EXTRA[2], title: "Be Gay Tomorrow", meta: "2022 · SPAIN · 14+", text: "Tonight is for the two of them." },
];

/* ------------------------------------------------------------------ */
/* tiny WeShort app UI pieces (rendered inside device screens)         */
/* ------------------------------------------------------------------ */

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

/**
 * Hero reel: the stills crossfade into each other on a 13.5s loop (staggered by
 * -4.5s each) with a slow push in, so the screen looks like it is playing.
 */
function WsHeroReel({ slides, scale = 1 }: { slides: Slide[]; scale?: number }) {
  const cycle = 13.5;
  const step = cycle / slides.length;
  return (
    <div className="relative flex-1 overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.title}
          className="animate-ws-slide absolute inset-0"
          style={{ animationDelay: `${-i * step}s` }}
        >
          <div className="animate-ws-zoom absolute inset-0" style={{ animationDelay: `${-i * step}s` }}>
            <Image src={s.src} alt="" fill sizes="600px" className="object-cover object-top" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />
          <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2" style={{ fontSize: `${8 * scale}px` }}>
            <p className="text-[2.2em] font-black uppercase leading-none tracking-tight">{s.title}</p>
            <p className="mt-1 text-[0.95em] font-semibold text-white/85">{s.meta}</p>
            <p className="mt-1 max-w-[70%] text-[0.9em] leading-snug text-white/70">{s.text}</p>
          </div>
        </div>
      ))}
      {/* playback bar — fills across one full reel cycle */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-white/15">
        <div className="animate-ws-progress h-full w-full bg-brand" />
      </div>
    </div>
  );
}

/**
 * Poster rail that slides by itself. The track carries the posters twice so the
 * -50% loop lands exactly back on the first one.
 */
function WsRail({
  label,
  items,
  scale = 1,
  reverse = false,
}: {
  label: string;
  items: string[];
  scale?: number;
  reverse?: boolean;
}) {
  const track = [...items, ...items];
  return (
    <div className="px-2.5 pt-1.5" style={{ fontSize: `${8 * scale}px` }}>
      <p className="mb-1 font-bold">
        {label} <span className="ml-1 font-normal text-white/50">Browse all ›</span>
      </p>
      {/* Track is exactly 2× the screen width and holds the posters twice, so a
          -50% shift lands on an identical frame. The gutter lives inside each
          cell (padding, not gap) — a flex gap would break that alignment. */}
      <div className="overflow-hidden">
        <div className={`flex w-[200%] ${reverse ? "animate-ws-rail-rev" : "animate-ws-rail"}`}>
          {track.map((s, i) => (
            <div key={i} className="w-[10%] shrink-0 pr-[3px]">
              <span className="relative block aspect-[3/4] overflow-hidden rounded-[2px]">
                <Image src={s} alt="" fill sizes="80px" className="object-cover" />
                <span className="absolute right-0.5 top-0.5 rounded-[2px] bg-black/70 px-0.5 text-[0.7em] text-white/90">
                  {12 + (i % items.length) * 3}&apos;
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Mobile app screen: status bar, logo, and a grid that drifts up on its own. */
function WsPhoneScreen({ items, scale = 1 }: { items: string[]; scale?: number }) {
  const titles = ["The Hole", "Be Gay Tomorrow", "La Slitta", "Des Hommes"];
  const track = [...items, ...items];
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
      {/* scrolling grid — same trick as the laptop rails: the tiles run twice and
          the gutter is cell padding, so -50% is a seamless loop */}
      <div className="mt-1 flex-1 overflow-hidden px-1.5">
        <div className="animate-ws-rail-y grid grid-cols-2">
          {track.map((s, i) => (
            <div key={i} className="p-[2px]">
              <span className="relative block aspect-[3/4] overflow-hidden rounded-[3px]">
                <Image src={s} alt="" fill sizes="80px" className="object-cover" />
                <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/85 to-transparent px-1 pb-1 pt-3 text-[0.8em] font-semibold uppercase leading-none">
                  {titles[i % titles.length]}
                </span>
              </span>
            </div>
          ))}
        </div>
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

/** iPhone-style frame: titanium edge, side buttons, dynamic island, home indicator. */
function PhoneFrame({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
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
 * All-devices — the WeShort device family shot laid out across the full section
 * width: big TV back-centre with its stand, laptop front-right, white tablet
 * front-left, phone tucked in front of the TV's left edge. Every screen plays by
 * itself (see the ws-* animations in globals.css).
 *
 * The percentages are deliberate: every device's right edge (including the
 * laptop's -4% base overhang) stays inside 100%, and the lowest bottom edge lands
 * around 93%, so nothing can be clipped by the stage box at any width.
 * (Set FEATURE_IMAGES.devices in constants.ts to use a real render instead.)
 */
function DevicesMock() {
  return (
    <div data-fx="zoom" data-amount="0.12" className="relative mx-auto aspect-[1570/620] w-full select-none">
      {/* TV — back centre */}
      <div className="absolute left-[30%] top-[4%] w-[40%]">
        <div className="rounded-[4px] bg-[#0b0d12] p-[4px] shadow-[0_40px_80px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <div className="flex aspect-[16/9] flex-col overflow-hidden rounded-[2px] bg-black">
            <WsNav scale={1.05} />
            <WsHeroReel slides={TV_SLIDES} scale={1.05} />
          </div>
        </div>
        {/* neck + foot */}
        <div className="mx-auto h-[14px] w-[9%] bg-[linear-gradient(to_bottom,#1c2029,#0b0d12)]" />
        <div className="mx-auto h-[6px] w-[36%] rounded-[3px] bg-[linear-gradient(90deg,#1c2029,#3a4150,#1c2029)] shadow-[0_10px_20px_rgba(0,0,0,0.6)]" />
      </div>

      {/* Laptop — front right */}
      <div className="absolute left-[69%] top-[42%] w-[28%]">
        <div className="rounded-t-[8px] bg-[#0f1218] p-[5px] pb-0 shadow-[0_35px_70px_rgba(0,0,0,0.75)] ring-1 ring-white/10">
          <div className="flex aspect-[16/10] flex-col overflow-hidden rounded-t-[3px] bg-black">
            <WsNav scale={0.8} />
            <WsRail label="Nuove Uscite 4Free" items={[DEV[0], DEV[1], DEV[2], EXTRA[0], EXTRA[1]]} scale={0.8} />
            <WsRail label="Oscars®" items={[EXTRA[2], EXTRA[3], DEV[3], EXTRA[4], DEV[0]]} scale={0.8} reverse />
          </div>
        </div>
        {/* base */}
        <div className="-mx-[4%] h-[9px] rounded-b-[8px] bg-[linear-gradient(to_bottom,#3a4150,#1c2029)] shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
          <div className="mx-auto h-[3px] w-[14%] rounded-b-[3px] bg-[#0b0d12]" />
        </div>
      </div>

      {/* Tablet — front left, white bezel */}
      <WhiteTabletFrame className="absolute left-[3%] top-[46%] w-[24%]">
        <WsNav scale={0.55} />
        <WsHeroReel slides={TABLET_SLIDES} scale={0.62} />
      </WhiteTabletFrame>

      {/* Phone — in front of the TV's left edge, clear of the tablet */}
      <PhoneFrame className="absolute left-[27.5%] top-[55%] w-[6.5%] drop-shadow-[0_25px_40px_rgba(0,0,0,0.75)]">
        <WsPhoneScreen items={[EXTRA[0], DEV[2], EXTRA[3], DEV[0]]} scale={0.6} />
      </PhoneFrame>
    </div>
  );
}

/**
 * The lit stage the family stands on. Every layer sits *behind or below* the
 * devices and is clipped by this box, so none of it can push the composition
 * out of the section the way a scaled wrapper would.
 */
function Stage({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* key light behind the TV */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[-6%] h-[72%] w-[62%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(120,170,255,0.16),transparent_70%)] blur-[60px]"
      />
      {/* warm brand kicker from the left, so the light has a direction */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[6%] top-[26%] h-[52%] w-[38%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(229,9,20,0.13),transparent_70%)] blur-[70px]"
      />

      <div className="relative">{children}</div>

      {/* floor: horizon, pooled light, and a mirrored smear under each device */}
      <div aria-hidden className="pointer-events-none relative mx-auto h-14 w-full sm:h-20">
        <div className="absolute inset-x-[8%] top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_46%_100%_at_50%_0%,rgba(120,170,255,0.16),transparent_72%)]" />
        {FOOTPRINTS.map((f) => (
          <span
            key={f.key}
            className="absolute top-0 rounded-b-[50%] bg-gradient-to-b from-white/[0.09] to-transparent blur-[6px]"
            style={{ left: f.left, width: f.width, height: f.height }}
          />
        ))}
        <div className="absolute inset-x-[14%] top-0 h-3 bg-[radial-gradient(ellipse_50%_100%_at_50%_0%,rgba(0,0,0,0.55),transparent_78%)]" />
      </div>
    </div>
  );
}

/** Where each device meets the floor, used to place its reflection. */
const FOOTPRINTS = [
  { key: "tablet", left: "3%", width: "24%", height: "52%" },
  { key: "phone", left: "27.5%", width: "6.5%", height: "64%" },
  { key: "tv", left: "30%", width: "40%", height: "100%" },
  { key: "laptop", left: "69%", width: "28%", height: "58%" },
];

/** The four surfaces, named under the stage like a caption line. */
const SURFACES = [
  { label: "Smart TV", icon: <><rect x="2" y="4" width="20" height="13" rx="2" /><path d="M8 21h8M12 17v4" /></> },
  { label: "Laptop", icon: <><rect x="3" y="5" width="18" height="11" rx="2" /><path d="M2 19h20" /></> },
  { label: "Tablet", icon: <><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M11 18h2" /></> },
  { label: "Phone", icon: <><rect x="7" y="2" width="10" height="20" rx="2.5" /><path d="M11 18.5h2" /></> },
];

/** "Weshort on all devices" — first half of the features band. */
export default function Devices() {
  const image = featureImage("devices");

  return (
    <section id="devices" className="section-screen px-6 pb-10 pt-28 sm:px-12">
      {/* stage on the left, copy on the right; stacks on small screens */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.7fr_1fr] lg:gap-14">
        <div>
          <Reveal from="left" distance={40} scale>
            <Stage>
              {image ? (
                <div className="relative mx-auto aspect-[1570/620] w-full">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 92vw, 720px"
                    className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
                  />
                </div>
              ) : (
                <DevicesMock />
              )}
            </Stage>
          </Reveal>

          {/* caption line: the surfaces themselves, named */}
          <Reveal from="left" delay={100} distance={16} className="mt-1">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-9">
              {SURFACES.map((s) => (
                <li key={s.label} className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.16em] text-white/45">
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white/35" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    {s.icon}
                  </svg>
                  {s.label}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* copy column */}
        <Reveal from="right" delay={140} className="lg:pl-2">
          <div aria-hidden className="mb-6 h-px w-16 bg-gradient-to-r from-brand/70 to-transparent" />

          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand">Watch anywhere</p>

          <h2 className="mt-4 text-[1.7rem] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[2.15rem]">
            Your entertainment, anytime, anywhere
            <span className="mt-1 block font-light text-white/55">Weshort on all your devices</span>
          </h2>

          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-muted">
            Weshort is compatible with a wide range of devices, so you can watch on the device of your
            choice. Whether you prefer watching on a big screen or a smaller device, Weshort has you covered.
          </p>

          <Link
            href="#"
            className="group mt-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.04] py-2.5 pl-5 pr-4 text-sm font-semibold text-white backdrop-blur-sm transition-colors duration-300 hover:border-white/35 hover:bg-white/[0.08]"
          >
            View device list
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
