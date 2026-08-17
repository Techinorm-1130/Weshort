/**
 * Central place for static asset paths.
 * Drop your files into `public/images/...` and update these paths.
 */
export const IMAGES = {
  /** Set to null to fall back to the text wordmark. */
  logo: null as string | null, // e.g. "/images/logo/logo.png"
  /** Auth pages (login / signup / forgot) background — poster collage. */
  authBackground: "/images/backgrounds/the_netflix_login_bg.jpg" as string | null,
  /** Landing hero background — same collage, rendered at low opacity. */
  heroBackground: "/images/backgrounds/the_netflix_login_bg.jpg" as string | null,
  /**
   * Hero poster stack (front → back). Drop files in `public/images/posters/`
   * and set `src`; while `src` is null a styled placeholder card is shown.
   */
  heroPosters: [
    { src: "/images/backgrounds/object1.png" as string | null, title: "Rebel Ridge", from: "#3b4a2b", to: "#0e120a" },
    { src: "/images/backgrounds/object2.png" as string | null, title: "The Day After Tomorrow", from: "#1d5d8f", to: "#0a1f3a" },
    { src: "/images/backgrounds/object3.png" as string | null, title: "Poster 3", from: "#8a5a1e", to: "#2b1a08" },
  ],
} as const;

/** Poster artwork available for the category cards (public/images/backgrounds/posters/). */
const P = {
  p1: "/images/backgrounds/posters/poster1.jpg", // 8⭐️
  p2: "/images/backgrounds/posters/poster2.jpg", // Fall (2022)
  p3: "/images/backgrounds/posters/poster3.jpg", // Nowhere
  p4: "/images/backgrounds/posters/poster4.jpg", // Peaky Blinders
  o1: "/images/backgrounds/object1.png", // Rebel Ridge
  o2: "/images/backgrounds/object2.png", // The Day After Tomorrow
  o3: "/images/backgrounds/object3.png", // Uglies
} as const;

/**
 * "Explore our wide variety of categories" carousel.
 * Each card shows a 2×2 grid of posters (4 image paths; null = placeholder tile).
 * Add more files to `public/images/backgrounds/posters/` and reference them here.
 */
export const CATEGORIES: { name: string; href: string; posters: (string | null)[] }[] = [
  { name: "Action",      href: "#", posters: [P.o1, P.p4, P.p2, P.o3] },
  { name: "Adventure",   href: "#", posters: [P.p2, P.o2, P.p3, P.p1] },
  { name: "Comedy",      href: "#", posters: [P.p1, P.o3, P.o1, P.p4] },
  { name: "Drama",       href: "#", posters: [P.p4, P.p3, P.o2, P.o1] },
  { name: "Horror",      href: "#", posters: [P.p3, P.p2, P.p1, P.o3] },
  { name: "Documentary", href: "#", posters: [P.o2, P.p1, P.p4, P.p2] },
  { name: "Sci-Fi",      href: "#", posters: [P.o3, P.o2, P.p3, P.p1] },
  { name: "Romance",     href: "#", posters: [P.p2, P.o1, P.p4, P.o2] },
];

/**
 * Feature rows (devices / download / kids). Drop real illustrations into
 * `public/images/features/` and set the paths; null = built-in CSS mockup.
 */
export const FEATURE_IMAGES = {
  devices: null as string | null, // e.g. "/images/features/devices.png"
  download: null as string | null,
  kids: null as string | null,
} as const;

export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
} as const;

export const LANGUAGES = [
  { code: "en", label: "English", flag: "gb" },
  { code: "it", label: "Italiano", flag: "it" },
] as const;

export const SITE = {
  name: "Weshort",
  supportPhone: "000-000-0000",
  legal:
    "WeShort S.r.l. — Share Capital VAT N. 00000000000 — Headquarters: Corso Alcide De Gasperi 314/A, Bari, Italy",
} as const;
