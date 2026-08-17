/** Tiny inline SVG flags (no external assets). */
export default function Flag({ code, className = "h-3.5 w-5" }: { code: string; className?: string }) {
  if (code === "it") {
    return (
      <svg viewBox="0 0 30 20" className={`${className} rounded-[2px]`} aria-hidden>
        <rect width="10" height="20" fill="#009246" />
        <rect x="10" width="10" height="20" fill="#ffffff" />
        <rect x="20" width="10" height="20" fill="#ce2b37" />
      </svg>
    );
  }
  // gb (simplified Union Jack)
  return (
    <svg viewBox="0 0 30 20" className={`${className} rounded-[2px]`} aria-hidden>
      <rect width="30" height="20" fill="#012169" />
      <path d="M0 0l30 20M30 0L0 20" stroke="#ffffff" strokeWidth="4" />
      <path d="M0 0l30 20M30 0L0 20" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M15 0v20M0 10h30" stroke="#ffffff" strokeWidth="6" />
      <path d="M15 0v20M0 10h30" stroke="#C8102E" strokeWidth="3.2" />
    </svg>
  );
}
