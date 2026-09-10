import Image from "next/image";
import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

/**
 * The close, built on the same banner the landing page signs off with — art
 * running off to the right, copy left, red action right — so the two pages end
 * in the same voice. Both upload pages use it; the words, the still and the
 * action are passed in.
 *
 * The motion is back but the two things that caused the flickering edges are
 * not: no `mask-image` and no promoted layer. A slow push on the art, one pass
 * of light and a live eyebrow are all ordinary painted layers, which the clip
 * handles without recomputing a boundary every frame.
 */
export default function SlateBanner({
  id = "contact",
  image = "/images/production house posters/volv.jpg",
  focus = "68% 22%",
  eyebrow = "Next step",
  title = "Send us your title list",
  body = "A spreadsheet is enough to start. We come back with territories, term and split within two weeks, and you have a named contact from the first reply. Deals start at six titles.",
  action = { label: "Talk to Partnerships", href: "#" },
}: {
  id?: string;
  image?: string;
  /** Where to hold the crop — every still puts its subject somewhere different. */
  focus?: string;
  eyebrow?: string;
  title?: string;
  body?: string;
  action?: { label: string; href: string };
} = {}) {
  return (
    <section id={id} className="scroll-mt-32 px-6 py-16 sm:px-12 sm:py-20">
      <Reveal scale distance={32} className="relative mx-auto max-w-6xl overflow-hidden rounded-xl ring-1 ring-white/10">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1152px) 100vw, 1152px"
          className="animate-ws-zoom object-cover"
          style={{ objectPosition: focus }}
        />
        {/* black fade from the left + red tint — the page is black here, not navy */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-black/30" />
        <div className="absolute inset-0 bg-brand/15 mix-blend-multiply" />

        {/* a pass of light across the band. Inset by a pixel so the sweep never
            reaches the rounded corner it would otherwise antialias against. */}
        <span
          aria-hidden
          className="animate-shimmer pointer-events-none absolute inset-y-px left-px w-1/4 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)]"
        />

        <div className="relative flex flex-col gap-6 px-8 py-11 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div className="max-w-xl">
            <p className="flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.3em] text-brand">
              <span className="animate-blink h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_8px_rgba(229,9,20,0.9)]" />
              {eyebrow}
            </p>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{title}</h2>
            <p className="mt-2 text-sm text-muted">{body}</p>
          </div>
          <Link
            href={action.href}
            className="group inline-flex shrink-0 items-center gap-2.5 rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-[0_16px_40px_-16px_rgba(229,9,20,0.95)] transition duration-300 hover:bg-brand-hover active:scale-[0.99]"
          >
            {action.label}
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
