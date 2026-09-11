import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import { Block, Heading, RED } from "@/components/upload/Parts";
import FilmHero from "@/components/upload/FilmHero";
import SubmitStart from "@/components/upload/SubmitStart";
import ProcessTimeline from "@/components/upload/ProcessTimeline";
import DeliverySpec from "@/components/upload/DeliverySpec";
import SlateBanner from "@/components/upload/SlateBanner";

export const metadata: Metadata = {
  title: "Submit your film",
  description:
    "Producers and directors: submit your short film to Weshort. Curated programming, worldwide reach, and you keep your rights.",
};

const STEPS = [
  {
    title: "Send us the film",
    body: "A private link is enough to start — Vimeo, Frame.io or a screener file, plus a short synopsis and your festival history.",
    meta: "10 minutes",
  },
  {
    title: "First viewing",
    body: "Two programmers watch it in full. Every submission is watched to the end, whoever sent it.",
    meta: "Within 10 days",
  },
  {
    title: "Offer and licence",
    body: "If it's a yes, you get the territories, term and revenue split in writing before anything is signed.",
    meta: "Within 3 weeks",
  },
  {
    title: "Delivery and premiere",
    body: "Send the master and artwork; we handle encoding, subtitles and the release slot, and tell you the date it goes live.",
    meta: "Around 4 weeks",
  },
];

const SPECS = [
  {
    label: "Runtime",
    summary: "Up to 40 minutes",
    value:
      "Up to 40 minutes. Anything longer, talk to us first — we do programme longer work, but it is scheduled differently.",
  },
  {
    label: "Picture",
    summary: "ProRes 422 HQ or higher, 4K preferred",
    value:
      "ProRes 422 HQ or higher. 1080p minimum, 4K preferred, at 24, 25 or 30 fps. Send the screener first; the master is only needed once a film is taken.",
  },
  {
    label: "Sound",
    summary: "Stereo required, 5.1 welcome",
    value:
      "A stereo mix is required and 5.1 is welcome. Peaks at −2 dBTP, programme level −23 LUFS. We will flag anything that needs a re-mix rather than rejecting it.",
  },
  {
    label: "Subtitles",
    summary: "English SRT for non-English dialogue",
    value:
      "An English SRT is required for non-English dialogue. We produce, translate and QC every other language at our own cost, and send them for your approval.",
  },
  {
    label: "Poster",
    summary: "3:4 · 1500 × 2000 px",
    value:
      "One 3:4 poster at 1500 × 2000 px, JPG or PNG, with no titling burned in — we localise the title per territory. This is the image the film is listed under.",
  },
  {
    label: "Thumbnail",
    summary: "16:9 · 1920 × 1080 px",
    value:
      "One 16:9 still at 1920 × 1080 px, taken from the film rather than made for it. A banner at 2560 × 1440 px is optional and only used if the film is featured.",
  },
  {
    label: "Rights",
    summary: "Non-exclusive, you keep copyright",
    value:
      "Non-exclusive, and you keep copyright. Festivals, sales and screenings all stay open. Music and archive must be cleared for streaming for the licence term.",
  },
];

export default function ProducerDirectorPage() {
  return (
    <>
      <Navbar />
      <main className="font-display relative bg-black">
        <FilmHero />

        <SubmitStart />

        <Block>
          <Heading
            accent={RED}
            eyebrow="The process"
            title="Four steps, and you always know where you are"
            lede="You hear from a person at every stage — including when the answer is no."
          />
        </Block>

        <ProcessTimeline steps={STEPS} />

        <DeliverySpec
          id="specs"
          rows={SPECS}
          eyebrow="Requirements"
          title="What to have ready"
          lede="Send the screener first — nothing below is needed until a film has been accepted. Open a line for the full requirement."
          sheet="Submission specification"
          note="Screener first, master only once a film is taken"
        />

        <SlateBanner
          id="send"
          image="/images/production house posters/volv.jpg"
          focus="68% 22%"
          eyebrow="Next step"
          title="Send us the film"
          body="One link and a short synopsis. Two programmers watch it in full, you hear back inside three weeks, and there is no submission fee — ever."
          action={{ label: "Start a Submission", href: "#submit" }}
        />

        {/* black page, navy footer: ease one into the other so they do not meet
            on a hard line */}
        <div aria-hidden className="h-28 bg-gradient-to-b from-black to-background sm:h-36" />

      </main>
      <SiteFooter />
    </>
  );
}
