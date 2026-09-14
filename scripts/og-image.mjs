/**
 * Default social card generator.
 *
 * One 1200x630 JPEG, drawn in the same language as the blog covers: the blue
 * ramp from global.css, the liquid mass from GooeyBackground and a lime
 * accent. The PLOP wordmark is the approved vector (AGENTS §6) — it is
 * embedded from src/assets/img/logo.svg, never redrawn with type.
 *
 * JPEG and not WebP because WhatsApp will not preview a WebP card, which is
 * where most of this site's links get shared.
 *
 * Run: npm run og
 */
import { chromium } from "playwright";
import { mkdir, readFile, stat } from "node:fs/promises";
import path from "node:path";

const OUT = "public/assets/og";
const FILE = "plop-og.jpg";
const W = 1200;
const H = 630;

const logo = await readFile("src/assets/img/logo.svg", "utf8");

/* Blue ramp pair and liquid positions, in canvas units. Fixed, so a rerun
   produces the same card. */
const BLOBS = [
  [90, 120, 210],
  [270, 240, 150],
  [-40, 300, 170],
  [1120, 540, 220],
  [960, 640, 160],
  [1190, 380, 130],
];

const document = () => `<!doctype html><html><head><meta charset="utf-8"><style>
  html,body{margin:0;padding:0;background:#000}
  svg{display:block}
</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#2563ff"/>
      <stop offset="1" stop-color="#1948c7"/>
    </linearGradient>
    <radialGradient id="lift" cx="0.22" cy="0.18" r="0.85">
      <stop offset="0" stop-color="#5aa8ff" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#5aa8ff" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="vignette" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stop-color="#000" stop-opacity="0"/>
      <stop offset="1" stop-color="#000" stop-opacity="0.3"/>
    </radialGradient>
    <filter id="goo" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="30" result="blurred"/>
      <feColorMatrix in="blurred" type="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#ground)"/>
  <rect width="${W}" height="${H}" fill="url(#lift)"/>

  <g filter="url(#goo)" opacity="0.14">
    ${BLOBS.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`).join("")}
  </g>

  <!-- The wordmark alone, centred, at 520px wide. It already carries the
       lime accent; nothing else belongs on a card this size. -->
  <g transform="translate(340 202) scale(${520 / 847})">
    ${logo.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "")}
  </g>

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
</svg></body></html>`;

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: W, height: H },
  deviceScaleFactor: 1,
});
const tab = await context.newPage();

await tab.setContent(document(), { waitUntil: "load" });
await tab.screenshot({
  path: path.join(OUT, FILE),
  type: "jpeg",
  quality: 88,
});
await browser.close();

const { size } = await stat(path.join(OUT, FILE));
console.log(`${FILE}  ${W}x${H}  ${Math.round(size / 1024)} KB`);
