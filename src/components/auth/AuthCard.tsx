import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Optional content under the card (links etc.). */
  footer?: ReactNode;
};

/** Glass card used by all auth forms. */
export default function AuthCard({ title, subtitle, children, footer }: Props) {
  return (
    <div className="animate-fade-up w-full max-w-md" style={{ animationDelay: "120ms" }}>
      <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-background-dark/75 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:p-10">
        <div className="relative">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
          <div className="mt-8">{children}</div>
        </div>
      </section>
      {footer ? (
        <div className="mt-6 text-center text-sm text-white/80 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
