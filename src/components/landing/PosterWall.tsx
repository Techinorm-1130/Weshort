import Image from "next/image";
import { HERO_WALL } from "@/lib/constants";

/**
 * Nine columns, each drifting at its own pace and in its own direction. More
 * columns across the same width means smaller tiles; the last few drop away on
 * narrower screens so they never get squeezed.
 */
const COLUMNS = [
  { seed: 11, dir: "up", speed: "46s", className: "" },
  { seed: 27, dir: "down", speed: "56s", className: "" },
  { seed: 43, dir: "up", speed: "50s", className: "" },
  { seed: 58, dir: "down", speed: "62s", className: "" },
  { seed: 71, dir: "up", speed: "54s", className: "hidden sm:flex" },
  { seed: 89, dir: "down", speed: "58s", className: "hidden lg:flex" },
  { seed: 97, dir: "up", speed: "64s", className: "hidden lg:flex" },
  { seed: 113, dir: "down", speed: "52s", className: "hidden xl:flex" },
  { seed: 131, dir: "up", speed: "60s", className: "hidden xl:flex" },
] as const;

/** Smaller tiles are shorter, so a column needs more of them to overflow the screen. */
const PER_COLUMN = 11;

/** Seeded PRNG — the shuffle has to come out identical on the server and the client. */
function rng(seed: number) {
  let s = (seed * 48271) % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}

/**
 * A column's worth of artwork: the poster list reshuffled per column, so no two
 * columns run the same order and nothing repeats back to back — not even across
 * the loop's seam.
 */
function deck(seed: number) {
  const rand = rng(seed);
  const out: string[] = [];

  while (out.length < PER_COLUMN) {
    const pool = [...HERO_WALL];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    for (const poster of pool) {
      if (out.length && out[out.length - 1] === poster) continue;
      out.push(poster);
      if (out.length === PER_COLUMN) break;
    }
  }

  // the column loops, so the last poster must not butt up against the first
  if (out[0] === out[out.length - 1]) {
    const swap = out.findIndex((p, i) => i > 0 && i < out.length - 2 && p !== out[0]);
    if (swap > 0) [out[swap], out[out.length - 1]] = [out[out.length - 1], out[swap]];
  }

  return out;
}

/**
 * The hero's tilted wall of posters: columns drifting vertically behind a 3D
 * rotation, running from behind the copy out past the right edge and all the
 * way down to the bottom of the section.
 */
export default function PosterWall() {
  return (
    <div
      aria-hidden
      className="absolute inset-y-0 right-0 w-full overflow-hidden md:w-[88%] lg:w-[86%]"
      style={{ perspective: "1600px" }}
    >
      <div
        className="absolute -inset-y-[20%] left-[-10%] right-[-10%] flex gap-2 sm:gap-2.5"
        style={{
          // rotateZ is positive so the wall leans the same way as the reference:
          // its edges run top-right to bottom-left, not top-left to bottom-right.
          transform: "rotateY(-17deg) rotateX(4deg) rotateZ(7deg) scale(1.09)",
          transformOrigin: "72% 50%",
        }}
      >
        {COLUMNS.map((col, c) => {
          const posters = deck(col.seed);
          return (
            <div
              key={c}
              className={`flex min-w-0 flex-1 flex-col gap-2 sm:gap-2.5 ${col.className}`}
              // only the top is softened — the wall carries on to the bottom edge
              style={{ maskImage: "linear-gradient(to bottom, transparent 0%, #000 7%, #000 100%)" }}
            >
              <div
                className={col.dir === "up" ? "animate-reel-up" : "animate-reel-down"}
                style={{ animationDuration: col.speed }}
              >
                {/* the list twice over, so the loop is seamless */}
                {[0, 1].map((pass) => (
                  <div key={pass} className="flex flex-col gap-2 pb-2 sm:gap-2.5 sm:pb-2.5">
                    {posters.map((src, i) => (
                      <div
                        key={`${pass}-${i}`}
                        className="relative aspect-[2/3] w-full shrink-0 overflow-hidden rounded-md ring-1 ring-white/10"
                        style={{ boxShadow: "0 14px 30px -14px rgba(0,0,0,0.9)" }}
                      >
                        <Image
                          src={src}
                          alt=""
                          fill
                          sizes="(max-width: 768px) 22vw, 10vw"
                          priority={pass === 0 && i < 2}
                          className="object-cover"
                        />
                        {/* keeps the artwork from fighting the headline */}
                        <span className="absolute inset-0 bg-black/25" />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
