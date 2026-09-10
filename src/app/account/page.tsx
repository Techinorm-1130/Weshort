import type { Metadata } from "next";
import Navbar from "@/components/landing/Navbar";
import SiteFooter from "@/components/layout/SiteFooter";
import ProfileView from "@/components/account/ProfileView";

export const metadata: Metadata = {
  title: "Your profile",
  description: "Your Weshort account, your details, and the films you have submitted for review.",
};

/**
 * The signed-in member's profile.
 *
 * It exists because a submission has to be attributable: the account shown here
 * is the one stamped onto every film sent from this browser, which is how the
 * admin knows who uploaded what. The submissions list reads the same records
 * back, filtered by that id.
 */
export default function AccountPage() {
  return (
    <>
      <Navbar />
      <main className="font-display relative min-h-screen bg-black px-6 pb-24 pt-32 sm:px-12 sm:pt-36">
        <div className="mx-auto max-w-4xl">
          <p className="flex items-center gap-2.5 font-mono text-[10.5px] uppercase tracking-[0.3em] text-brand">
            <span className="h-px w-8 bg-brand" />
            Account
          </p>
          <h1 className="mt-4 text-[2rem] font-bold leading-[1.12] tracking-[-0.025em] sm:text-[2.4rem]">
            Your profile
          </h1>
          <p className="mt-4 max-w-lg text-[14.5px] leading-relaxed text-white/50">
            Who you are on Weshort, and what has happened to the films you have sent us.
          </p>

          <div className="mt-12">
            <ProfileView />
          </div>
        </div>
      </main>
      <div aria-hidden className="h-24 bg-gradient-to-b from-black to-background sm:h-32" />
      <SiteFooter />
    </>
  );
}
