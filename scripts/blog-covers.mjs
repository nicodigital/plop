/**
 * Blog cover generator.
 *
 * Every cover is drawn here, not sourced: one deterministic SVG composition
 * per post, rendered by headless Chromium and encoded to WebP. The drawing
 * speaks the site's own language — the blue ramp, the liquid mass from
 * GooeyBackground, a lime accent, and one stroked motif on the round-cap grid
 * the icon set uses.
 *
 * No cover carries text: the information lives outside the media (AGENTS §7),
 * and a rendered headline would be unreadable at card size anyway.
 *
 * Run: npm run covers
 */
import { chromium } from "playwright";
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const OUT = "src/assets/img/blog";
const W = 1600;
const H = 900;

/* ---------------------------------------------------------------- motifs */
/* Each motif is drawn on the full 1600x900 canvas. Exactly one element in
   each carries the lime, so the accent stays an accent. */

const line = (extra) =>
  `fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" ${extra ?? ""}`;
const lime = (extra) =>
  `fill="none" stroke="#c7ff00" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" ${extra ?? ""}`;

const MOTIFS = {
  /** A viewport whose top band — the first screen — is the lit part. */
  viewport: `
    <rect x="520" y="250" width="560" height="400" rx="40" ${line('opacity="0.45"')}/>
    <rect x="520" y="350" width="560" height="300" fill="#fff" opacity="0.06"/>
    <path d="M520 350 H1080" ${line('opacity="0.45"')}/>
    <path d="M572 300 h40 M652 300 h40" ${line('opacity="0.55"')}/>
    <path d="M580 424 h300 M580 484 h200" ${line('opacity="0.85"')}/>
    <rect x="580" y="540" width="170" height="60" rx="30" ${lime()}/>
  `,
  /** The parts a price is made of, stacked, plus the one that repeats. */
  ledger: `
    <rect x="470" y="300" width="420" height="70" rx="35" ${line('opacity="0.55"')}/>
    <rect x="470" y="415" width="640" height="70" rx="35" ${line('opacity="0.8"')}/>
    <rect x="470" y="530" width="300" height="70" rx="35" ${lime()}/>
    <circle cx="1030" cy="565" r="86" ${line('opacity="0.5"')}/>
    <circle cx="1030" cy="565" r="40" fill="#fff" opacity="0.14"/>
  `,
  /** A gauge, needle short of the top — speed as something measured. */
  gauge: `
    <path d="M520 620 A280 280 0 0 1 1080 620" ${line('opacity="0.4"')}/>
    <path d="M520 620 A280 280 0 0 1 642 392" ${lime()}/>
    <path d="M800 620 L935 455" ${line()}/>
    <circle cx="800" cy="620" r="34" fill="#fff" opacity="0.92"/>
    <path d="M690 706 h220" ${line('opacity="0.35"')}/>
  `,
  /** A pin on a street grid, with the search radius drawn around it. */
  pin: `
    <path d="M470 330 H1130 M470 470 H1130 M470 610 H1130" ${line('opacity="0.22"')}/>
    <path d="M620 250 V690 M800 250 V690 M980 250 V690" ${line('opacity="0.22"')}/>
    <circle cx="800" cy="450" r="230" ${lime('opacity="0.75" stroke-dasharray="6 34"')}/>
    <path d="M800 642 C800 642 690 520 690 430 a110 110 0 1 1 220 0 c0 90 -110 212 -110 212 Z" ${line()}/>
    <circle cx="800" cy="428" r="46" fill="#fff" opacity="0.95"/>
  `,
  /** A load curve with one peak the flat base underneath absorbs. */
  peak: `
    <path d="M470 620 h660" ${line('opacity="0.35"')}/>
    <path d="M470 560 C580 555 620 540 700 420 C760 330 830 300 880 380 C940 475 1000 545 1130 548" ${line()}/>
    <path d="M880 300 V244" ${lime()}/>
    <circle cx="880" cy="372" r="30" fill="#c7ff00"/>
    <path d="M470 706 h180 M720 706 h180 M970 706 h160" ${line('opacity="0.25"')}/>
  `,
  /** Blocks of copy, and the one line that answers the question. */
  copyblocks: `
    <rect x="500" y="250" width="600" height="400" rx="40" ${line('opacity="0.35"')}/>
    <path d="M560 330 h340" ${line('opacity="0.9"')}/>
    <path d="M560 400 h480 M560 460 h420 M560 520 h300" ${line('opacity="0.45"')}/>
    <path d="M560 588 l52 52 l112 -142" ${lime()}/>
  `,
};

/* ---------------------------------------------------------------- covers */
/* `turn` rotates the liquid mass and `ground` picks where on the blue ramp
   the cover sits, so six covers in one grid never read as the same drawing. */

const COVERS = [
  { slug: "o-que-nao-pode-faltar-na-primeira-tela", motif: "viewport", ground: 0, turn: 0 },
  { slug: "quanto-custa-um-site-para-pequeno-negocio", motif: "ledger", ground: 1, turn: 180 },
  { slug: "site-lento-perde-cliente", motif: "gauge", ground: 2, turn: 90 },
  { slug: "aparecer-no-google-maps-em-curitiba", motif: "pin", ground: 1, turn: 270 },
  { slug: "seu-site-aguenta-a-temporada", motif: "peak", ground: 2, turn: 45 },
  { slug: "o-que-escrever-na-pagina-de-servicos", motif: "copyblocks", ground: 0, turn: 215 },
];

/** Ground pairs taken from the blue ramp in src/styles/global.css. */
const GROUNDS = [
  ["#1e66f2", "#152656"],
  ["#2563ff", "#1948c7"],
  ["#1650df", "#0d1630"],
];

/**
 * Liquid mass positions in canvas units. Fixed, so runs are reproducible.
 * Circles are grouped so each cluster overlaps: the goo filter only fuses
 * what already touches, and spaced-out circles come out as discs.
 */
const BLOBS = [
  // upper cluster
  [120, 140, 250],
  [340, 260, 180],
  [-30, 340, 200],
  // lower cluster
  [1450, 760, 280],
  [1250, 880, 200],
  [1560, 560, 170],
  // one satellite, to keep the composition from reading as two lumps
  [980, 105, 105],
];

const document = ({ motif, ground, turn }) => {
  const [from, to] = GROUNDS[ground];
  const blobs = BLOBS.map(
    ([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`,
  ).join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;background:#000}
    svg{display:block}
  </style></head><body>
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="${from}"/>
        <stop offset="1" stop-color="${to}"/>
      </linearGradient>
      <radialGradient id="lift" cx="0.22" cy="0.18" r="0.85">
        <stop offset="0" stop-color="#5aa8ff" stop-opacity="0.5"/>
        <stop offset="1" stop-color="#5aa8ff" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
        <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.32"/>
      </radialGradient>
      <!-- The GooeyBackground recipe: heavy blur, then an alpha ramp, so
           overlapping circles fuse into one mass instead of five discs. -->
      <filter id="goo" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="38" result="blurred"/>
        <feColorMatrix in="blurred" type="matrix"
          values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/>
      </filter>
    </defs>

    <rect width="${W}" height="${H}" fill="url(#ground)"/>
    <rect width="${W}" height="${H}" fill="url(#lift)"/>

    <g transform="rotate(${turn} ${W / 2} ${H / 2})" filter="url(#goo)" opacity="0.13">
      ${blobs}
    </g>

    <g>${MOTIFS[motif]}</g>

    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  </svg></body></html>`;
};

/* ----------------------------------------------------------------- build */

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});
const tab = await context.newPage();

for (const cover of COVERS) {
  await tab.setContent(document(cover), { waitUntil: "load" });
  const png = await tab.screenshot({ type: "png" });
  const info = await sharp(png)
    .webp({ quality: 82 })
    .toFile(path.join(OUT, `${cover.slug}.webp`));

  console.log(
    `${cover.slug}.webp  ${info.width}x${info.height}  ${Math.round(info.size / 1024)} KB`,
  );
}

await browser.close();
