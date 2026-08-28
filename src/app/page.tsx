import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import MoreReasons from "@/components/landing/MoreReasons";
import Categories from "@/components/landing/Categories";
import GenreSearch from "@/components/landing/GenreSearch";
import Devices from "@/components/landing/Devices";
import Kids from "@/components/landing/Kids";
import Faq from "@/components/landing/Faq";
import Plans from "@/components/landing/Plans";
import TrialBanner from "@/components/landing/TrialBanner";
import SiteFooter from "@/components/layout/SiteFooter";

/**
 * Landing page. Every block is a full-viewport "screen" (see .section-screen)
 * so only one section is in view at a time; scrolling snaps gently between them.
 */
export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <div id="home" className="section-screen">
          <Hero />
        </div>
        <div className="section-screen">
          <MoreReasons />
        </div>
        <div
          id="categories"
          className="section-screen section-deep-from-black"
        >
          <Categories />
        </div>
        {/* devices + kids share one band, taller than a screen: only the devices
            block is a snap target (so it always lands clear of the fixed navbar),
            then you scroll on freely to the kids block below it */}
        <div id="features" className="section-blue-black scroll-mt-24 pb-16 sm:pb-24">
          <Devices />
          <Kids />
        </div>
        <div id="genres" className="section-screen">
          <GenreSearch />
        </div>
        <div
          id="faq"
          className="section-screen section-deep"
        >
          <Faq />
        </div>
        {/* plans own the whole screen — the trial banner sits on its own strip below */}
        <div id="plans" className="section-screen">
          <Plans />
        </div>
        <TrialBanner />
      </main>
      <SiteFooter />
    </>
  );
}
