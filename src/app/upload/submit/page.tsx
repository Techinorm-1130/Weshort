import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import SubmitWizard from "@/components/upload/SubmitWizard";
import type { SubmitterKind } from "@/types/upload";

export const metadata: Metadata = {
  title: "Upload your film",
  description: "Send a film to Weshort for review — details, video, artwork and rights.",
};

const KINDS: SubmitterKind[] = ["producer", "director", "production-house"];

/**
 * The submission page. `?as=` carries which route the person came in by, so the
 * form opens on the right footing — the production-house page links with
 * `as=production-house`, the director page with `as=director`. It is only a
 * default; the field is editable on the "You" step.
 *
 * `?draft=` reopens something already started, so a film can be left half
 * filled in and finished another day.
 */
export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ as?: string; draft?: string }>;
}) {
  const { as, draft } = await searchParams;
  const kind = KINDS.includes(as as SubmitterKind) ? (as as SubmitterKind) : "director";

  return (
    <>
      <Navbar />
      <main className="font-display relative min-h-screen bg-black px-6 pb-24 pt-28 sm:px-10 sm:pt-32">
        <div className="mx-auto max-w-6xl">
          <header className="border-b border-white/[0.08] pb-8">
            <p className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.3em] text-brand">
              <span className="h-px w-7 bg-brand" />
              Upload
            </p>
            <h1 className="mt-3.5 text-[1.9rem] font-bold leading-[1.1] tracking-[-0.03em] sm:text-[2.3rem]">
              Send us your film
            </h1>
            <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-white/45">
              Everything below goes to our programmers for review. Nothing is published until it has
              been approved, and you hear back either way.
            </p>
          </header>

          <div className="mt-10">
            <SubmitWizard kind={kind} draftId={draft} />
          </div>
        </div>
      </main>
      <div aria-hidden className="h-24 bg-gradient-to-b from-black to-background sm:h-32" />
      <SiteFooter />
    </>
  );
}
