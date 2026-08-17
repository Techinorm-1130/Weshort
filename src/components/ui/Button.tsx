import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};

export default function Button({
  variant = "primary",
  loading = false,
  className = "",
  children,
  disabled,
  ...rest
}: Props) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 text-base font-semibold transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60";
  const styles = {
    primary:
      "bg-gradient-to-r from-brand to-[#ff2a36] text-white shadow-lg shadow-brand/30 hover:from-brand-hover hover:to-[#ff3d48] hover:shadow-brand/45",
    secondary:
      "border border-white/15 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/10",
    ghost: "text-white/80 hover:text-white",
  }[variant];

  return (
    <button className={`${base} ${styles} ${className}`} disabled={disabled || loading} {...rest}>
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
          Please wait…
        </>
      ) : (
        children
      )}
    </button>
  );
}
