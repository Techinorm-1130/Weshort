import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Categories from "@/components/landing/Categories";
import Features from "@/components/landing/Features";
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
        <div
          id="categories"
          className="section-screen section-deep"
        >
          <Categories />
        </div>
        {/* devices / download / kids grouped in one section (taller than a screen, scrolls freely) */}
        <div className="section-screen">
          <Features />
        </div>
        <div
          id="faq"
          className="section-screen section-deep"
        >
          <Faq />
        </div>
        <div id="plans" className="section-screen">
          <Plans />
          <TrialBanner />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
