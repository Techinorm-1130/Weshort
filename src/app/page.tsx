import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Categories from "@/components/landing/Categories";
import Features from "@/components/landing/Features";
import Faq from "@/components/landing/Faq";
import Plans from "@/components/landing/Plans";
import TrialBanner from "@/components/landing/TrialBanner";
import SiteFooter from "@/components/layout/SiteFooter";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Categories />
        <Features />
        <Faq />
        <Plans />
        <TrialBanner />
      </main>
      <SiteFooter />
    </>
  );
}
