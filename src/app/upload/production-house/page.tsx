import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import SlateBanner from "@/components/upload/SlateBanner";
import SlateHero from "@/components/upload/SlateHero";
import SlatePitch from "@/components/upload/SlatePitch";
import MarketOverview from "@/components/upload/MarketOverview";
import Testimonials from "@/components/upload/Testimonials";
import DeliverySpec from "@/components/upload/DeliverySpec";

export const metadata: Metadata = {
  title: "Licence your catalogue",
  description:
    "Production houses: bring your slate to Weshort. Catalogue licensing, bulk delivery, monthly reporting and a named partner manager.",
};

const SPECS = [
  {
    label: "Minimum slate",
    summary: "Six titles, or one anthology series",
    value:
      "Six titles, or one anthology series. Smaller catalogues are welcome through the producer and director route, which runs on the same terms per title.",
  },
  {
    label: "Masters",
    summary: "ProRes 422 HQ or IMF, 4K preferred",
    value:
      "ProRes 422 HQ or an IMF package. 1080p minimum, 4K preferred, 24/25/30 fps. Delivered over Aspera or to an S3 bucket we provision for you.",
  },
  {
    label: "Metadata",
    summary: "Our sheet, or your API",
    value:
      "Our sheet or your API: title, synopsis, cast and crew, genre, year, and the rights position and territory for every title in the slate.",
  },
  {
    label: "Subtitles",
    summary: "Source-language SRT per title",
    value:
      "A source-language SRT per title. We produce, translate and QC every other language at our own cost, and send them back for approval before release.",
  },
  {
    label: "Artwork",
    summary: "3:4 poster and 16:9 key art",
    value:
      "A 3:4 poster and 16:9 key art per title, 2000 px on the long edge. Layered files are welcome — we localise titling rather than burning it in.",
  },
  {
    label: "Rights",
    summary: "Non-exclusive or exclusive by territory",
    value:
      "Non-exclusive or exclusive by territory, your choice per title. Music and archive must be cleared for streaming for the length of the licence term.",
  },
];

export default function ProductionHousePage() {
  return (
    <>
      <Navbar />
      <main className="font-display relative bg-black">
        <SlateHero />

        <SlatePitch />

        <MarketOverview />

        <Testimonials />

        <DeliverySpec rows={SPECS} note="Masters and metadata only after terms are signed" />

        <SlateBanner />

        {/* This page runs on black; the shared footer starts on the site navy, so
            without a hand-off the two meet on a hard line. This eases one into
            the other. */}
        <div aria-hidden className="h-28 bg-gradient-to-b from-black to-background sm:h-36" />
      </main>
      <SiteFooter />
    </>
  );
}
