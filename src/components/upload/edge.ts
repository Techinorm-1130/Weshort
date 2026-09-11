/**
 * The page edge for the production-house hero: the hero copy, the section
 * heading and the first card all sit on this one line.
 *
 * It lives in its own plain module, not in SlateRow, because SlateRow is a
 * client component — a server component importing a value from one gets a client
 * reference back, not the string, and it stringifies into the class list as
 * "function() {...}".
 */
export const EDGE = "edge-x";
