import Image from "next/image";
import Link from "next/link";
import { IMAGES, ROUTES } from "@/lib/constants";
import Reveal from "@/components/ui/Reveal";

/** "Start your free trial today!" banner with the poster collage fading in from the right. */
export default function TrialBanner() {
  return (
    <section className="px-6 py-12 sm:px-12 sm:py-16">
      <Reveal scale distance={32} className="relative mx-auto max-w-6xl overflow-hidden rounded-xl ring-1 ring-white/10">
        {IMAGES.authBackground && (
          <Image
            src={IMAGES.authBackground}
            alt=""
            fill
            sizes="(max-width: 1152px) 100vw, 1152px"
            className="object-cover object-right"
          />
        )}
        {/* navy fade from the left + red tint */}
        <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/90 to-background-dark/30" />
        <div className="absolute inset-0 bg-brand/15 mix-blend-multiply" />

        <div className="relative flex flex-col gap-6 px-8 py-12 sm:flex-row sm:items-center sm:justify-between sm:px-12">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold sm:text-3xl">Start your free trial today!</h2>
            <p className="mt-2 text-sm text-muted">
              This is a clear and concise call to action that encourages users to sign up
              for a free trial of Weshort.
            </p>
          </div>
          <Link
            href={ROUTES.signup}
            className="inline-flex shrink-0 items-center justify-center rounded bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-hover"
          >
            Start a Free Trial
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
