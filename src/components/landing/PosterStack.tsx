import Image from "next/image";
import { IMAGES } from "@/lib/constants";

/**
 * Three fanned poster cards (front-left → back-right) with the red "///" swoosh,
 * like the current Netflix hero. Uses `IMAGES.heroPosters`.
 */
export default function PosterStack() {
  const posters = IMAGES.heroPosters;

  // front card first; back cards step up/right and rotate slightly
  const layout = [
    { left: "0%", top: "8%", rotate: "-4deg", z: 30, scale: 1 },
    { left: "34%", top: "0%", rotate: "3deg", z: 20, scale: 0.94 },
    { left: "60%", top: "-4%", rotate: "8deg", z: 10, scale: 0.9 },
  ];

  return (
    <div className="relative mx-auto h-[17rem] w-[14rem] sm:h-[28rem] sm:w-[24rem] lg:h-[30rem] lg:w-[26rem]">
      {posters.map((p, i) => {
        const l = layout[i] ?? layout[layout.length - 1];
        const hasImage = Boolean(p.src);
        return (
          <div
            key={p.title}
            className={`animate-float absolute aspect-[2/3] w-[58%] overflow-hidden rounded-xl drop-shadow-[0_25px_40px_rgba(0,0,0,0.65)] ${
              hasImage ? "" : "ring-1 ring-white/10"
            }`}
            style={
              {
                left: l.left,
                top: l.top,
                zIndex: l.z,
                // float keyframe reads these so rotation/scale are preserved
                "--rot": l.rotate,
                "--scl": l.scale,
                animationDelay: `${i * 0.9}s`,
                animationDuration: `${6 + i * 0.8}s`,
                background: hasImage
                  ? "transparent"
                  : `linear-gradient(160deg, ${p.from} 0%, ${p.to} 100%)`,
              } as React.CSSProperties
            }
          >
            {p.src ? (
              <Image
                src={p.src}
                alt={p.title}
                fill
                priority={i === 0}
                sizes="(max-width: 640px) 60vw, 260px"
                className="object-cover"
              />
            ) : (
              <>
                {/* small red brand mark like the "N" badge */}
                <span className="absolute left-3 top-3 text-xl font-black leading-none text-brand">
                  W
                </span>
                <span className="absolute left-3 right-3 top-9 text-2xl font-black uppercase leading-none tracking-tight text-white drop-shadow sm:text-3xl">
                  {p.title}
                </span>
                <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
              </>
            )}
          </div>
        );
      })}

      {/* red "///" swoosh bottom-left of the stack */}
      <svg
        aria-hidden
        viewBox="0 0 60 40"
        className="animate-swoosh absolute bottom-[4%] left-[-10%] h-12 w-16 text-brand"
        style={{ animationDelay: "900ms" }}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      >
        <path d="M6 30l14-14" />
        <path d="M22 34l14-16" />
        <path d="M40 34l12-14" />
      </svg>
    </div>
  );
}
