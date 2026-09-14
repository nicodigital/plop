# Media provenance

Every raster and video shipped in `public/` and where it came from.

| Shipped file | Source | Transform |
|---|---|---|
| `public/assets/img/logo.svg` | `assets/img/logo.svg` — approved PLOP! vector wordmark, supplied by the client | Coordinate precision rounded to 2dp and whitespace collapsed (125 KB → 109 KB). Paths, colours and proportions unchanged. |
| `public/favicon.svg` | Authored for this build | Original drawing: brand-blue rounded square, white `p`, lime dot. Not derived from the wordmark. |
| `public/assets/og/plop-og.jpg` | `scripts/og-image.mjs` — original composition authored for this build | Drawn as SVG (blue ramp ground, the GooeyBackground liquid mass) around the approved wordmark embedded verbatim from `src/assets/img/logo.svg`; rendered by headless Chromium at 1200×630 and encoded JPEG q88 → 32 KB. JPEG rather than WebP because WhatsApp will not preview a WebP social card. Deterministic: rerunning `npm run og` reproduces the same file. |
| `_astro/laptop-front.*.webp` (built) | `src/assets/img/laptop-front.png` — retouched front-on laptop render supplied by the client (1672×941, 340 KB) | Built by `astro:assets` from the FinalCta `<Image>`: WebP q82 at 560 / 1120 / 1672 px wide, alpha preserved. Nothing is hand-encoded, so the widths, the hashes and the intrinsic dimensions follow the master. |
| `public/assets/video/hero-laptop.webm` | `assets/video/bg-hero.mp4` — client-supplied hero render (1916×1080, 24fps, 15s, 18.5 MB) | Scaled to 1600px wide, audio stripped, VP9 CRF 40 → 638 KB |
| `public/assets/video/hero-laptop.mp4` | same | Scaled to 1600px wide, audio stripped, H.264 CRF 30, faststart → 789 KB |
| `public/assets/video/hero-laptop-poster.webp` | same | Frame at t=0.2s, 1600px wide, WebP q82 → 43 KB |
| `public/assets/portfolio/project-*.webm` | `assets/portfolio/*.webm` — scroll captures of delivered client sites (956×472, 30fps, VP9, no audio) | Trimmed to 10s from t=0.5, downscaled to 720px wide, re-encoded VP9 CRF 36 by `scripts/encode-portfolio.sh`. The bands never render a tile wider than 560 CSS px, and a tile is watched for a few seconds before it drifts off, so the 956px/13-38s sources were paying for pixels and minutes nobody sees. 8.5 MB → 3.1 MB across the ten files. |
| `public/assets/portfolio/project-*.mp4` | same | Same trim and scale, H.264 CRF 28, faststart, for browsers without VP9 |
| `public/assets/portfolio/project-*-poster.webp` | same | Frame at t=1s, 720px wide, WebP q72 |
| `src/assets/img/blog/*.webp` (6 covers) | `scripts/blog-covers.mjs` — original art authored for this build, not derived from any third-party image | Drawn as SVG (blue ramp ground, the GooeyBackground blur/alpha-ramp fused into one liquid mass, a lime accent, one stroked motif per post), rendered by headless Chromium at 1600×900 and encoded WebP q82 → 14–21 KB each. Deterministic: rerunning the script reproduces the same files. |
| `_astro/<post-slug>.*.webp` (built) | the six covers above | Built by `astro:assets` from `PostCard` and the article: WebP q82 at 640 px for the cards (≈4–7 KB) and 1400 / 1600 px for the article. Nothing is hand-encoded, so the widths and hashes follow the masters. |

Source masters stay in `assets/` and are not part of the production bundle.

## Naming

`NOMIA.webm` is unused: it is a second capture of the same client as
`NOMIA-2.webm`, and shipping both would read as two different clients.

## Presentation constraint

Portfolio media is shown by sector only. No client name, no client logo and no
link to the live site appears anywhere in the build.
