# Fonts — Netflix Sans

The site is styled with **Netflix Sans** (declared via `@font-face` in `src/app/globals.css`).
It is Netflix's proprietary typeface and is not on Google Fonts, so the `.woff2` files must be
provided here. Name them exactly:

| File                        | Weight |
| --------------------------- | ------ |
| `NetflixSans-Light.woff2`   | 300    |
| `NetflixSans-Regular.woff2` | 400    |
| `NetflixSans-Medium.woff2`  | 500    |
| `NetflixSans-Bold.woff2`    | 700    |
| `NetflixSans-Black.woff2`   | 900    |

Until the files exist the browser falls back to Helvetica Neue / Helvetica / Arial.
