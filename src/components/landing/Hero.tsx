import Image from "next/image";
import EmailCta from "@/components/landing/EmailCta";
import PosterStack from "@/components/landing/PosterStack";
import { IMAGES } from "@/lib/constants";

/**
 * Landing hero (current-Netflix style): faint poster-collage background,
 * headline + compact email CTA on the left, fanned poster stack on the right.
 */
export default function Hero() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden">
      {/* poster collage, kept subtle; everything below fades into the page colour */}
      {IMAGES.heroBackground && (
        <Image
          src={IMAGES.heroBackground}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-75"
        />
      )}
      {/* strong black shade over the image, then a blue shade layered on top of it */}
      <div className="absolute inset-0 bg-black/65" />
      {/* blue shade: lighter from the top to the centre, full strength below */}
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(10,47,102,0.03)_0%,rgba(10,47,102,0.06)_50%,rgba(10,47,102,0.25)_100%)]" />
      {/* faint shade at the very top (behind the navbar) */}
      <div className="absolute inset-x-0 top-0 h-[18%] bg-gradient-to-b from-background-dark/25 to-transparent" />
      {/* light shade on the left behind the copy for legibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-transparent" />
      {/* long fade into the page colour — the hero simply dissolves into the page */}
      <div className="absolute inset-x-0 bottom-0 h-[70%] bg-[linear-gradient(to_bottom,transparent_0%,color-mix(in_srgb,var(--background)_35%,transparent)_30%,color-mix(in_srgb,var(--background)_85%,transparent)_62%,var(--background)_82%,var(--background)_100%)]" />

      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pb-12 pt-28 sm:gap-14 sm:px-12 sm:pt-32 md:pb-8 lg:grid-cols-[1.15fr_1fr] lg:gap-8">
        {/* copy + CTA (staggered entrance) — centred on phones, left-aligned from md up */}
        <div className="mx-auto w-full max-w-xl text-center md:mx-0 md:text-left">
          <h1
            className="animate-fade-up text-[2.15rem] font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]"
            style={{ animationDelay: "80ms" }}
          >
            Unlimited movies,
            <br />
            TV shows &amp; more
          </h1>
          <p className="animate-fade-up mt-5 text-lg font-medium sm:text-xl" style={{ animationDelay: "220ms" }}>
            Starts at €7.99. Cancel anytime.
          </p>

          <div className="animate-fade-up" style={{ animationDelay: "360ms" }}>
            <EmailCta variant="compact" className="mx-auto mt-8 max-w-md md:mx-0" />
          </div>

          <p
            className="animate-fade-up mx-auto mt-3 max-w-sm text-sm text-white/70 md:mx-0"
            style={{ animationDelay: "480ms" }}
          >
            Ready to watch? Enter your email to create or restart your membership.
          </p>
        </div>

        {/* poster stack — hidden on phones for a clean hero */}
        <div
          className="animate-fade-up hidden justify-center overflow-visible px-6 md:flex lg:justify-end lg:px-0"
          style={{ animationDelay: "300ms" }}
        >
          <PosterStack />
        </div>
      </div>
    </section>
  );
}
