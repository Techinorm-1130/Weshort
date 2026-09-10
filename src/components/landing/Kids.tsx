import Image from "next/image";
import fs from "node:fs";
import path from "node:path";
import { FEATURE_IMAGES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

/**
 * Real illustration lookup (server-side): if `public/images/features/kids.(png|jpg|jpeg|webp)`
 * exists it is used automatically; otherwise the CSS mockup renders. An explicit path in
 * FEATURE_IMAGES always wins.
 */
function featureImage(name: "kids"): string | null {
  const explicit = FEATURE_IMAGES[name];
  if (explicit) return explicit;
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const rel = `/images/features/${name}.${ext}`;
    if (fs.existsSync(path.join(process.cwd(), "public", rel))) return rel;
  }
  return null;
}

const KIDS = [1, 2, 3].map((n) => `/images/backgrounds/kids/kid${n}.jpg`);

/** Three kids posters fanned out with the floating "kids" badge in front. */
function KidsMock() {
  const fan = [
    { src: KIDS[0], cls: "left-[6%] top-[12%] -rotate-[10deg] z-10" },
    { src: KIDS[2], cls: "right-[6%] top-[12%] rotate-[10deg] z-10" },
    { src: KIDS[1], cls: "left-1/2 top-[4%] -translate-x-1/2 z-20" },
  ];
  return (
    <div data-fx="rotate" data-amount="7" className="relative mx-auto aspect-[4/3] w-full max-w-md select-none">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[55%] w-[60%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400/20 blur-[70px]" />
      {fan.map((p) => (
        <div key={p.src} className={`absolute w-[38%] ${p.cls}`}>
          <span className="relative block aspect-[2/3] w-full overflow-hidden rounded-xl shadow-[0_30px_60px_rgba(0,0,0,0.7)] ring-1 ring-white/15">
            <Image src={p.src} alt="" fill sizes="200px" className="object-cover" />
          </span>
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

/** "Parental controls" — second half of the features band, reached by scrolling. */
export default function Kids() {
  const image = featureImage("kids");

  return (
    <section id="kids" className="scroll-mt-24 px-6 pb-4 pt-16 sm:px-12 sm:pt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <Reveal from="left" distance={40} scale>
          {image ? (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md">
              <Image
                src={image}
                alt=""
                fill
                sizes="(max-width: 1024px) 90vw, 460px"
                className="object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.6)]"
              />
            </div>
          ) : (
            <KidsMock />
          )}
        </Reveal>

        <Reveal from="right" delay={120} className="lg:pl-6">
          <Accent />
          <h2 className="text-2xl font-bold leading-snug sm:text-3xl">
            Parental Controls: Keeping Your Kids Safe On Weshort
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
            With parental controls, you can give your children the freedom to explore, while still
            keeping them safe from inappropriate content.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
