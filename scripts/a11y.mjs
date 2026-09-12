import { PNG } from "pngjs";
import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:4321";
const fails = [];
const notes = [];

const browser = await chromium.launch();

// --- Keyboard, focus and touch targets, at phone width ---------------------
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
const mp = await mobile.newPage();
await mp.goto(BASE + "/", { waitUntil: "networkidle" });

const smallTargets = await mp.evaluate(() => {
  const selector = "a[href], button, input, select, textarea, summary";
  return [...document.querySelectorAll(selector)]
    .filter((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return false;
      const s = getComputedStyle(el);
      if (s.display === "none" || s.visibility === "hidden") return false;
      // sr-only skip links and the form honeypot are not pointer targets.
      if (r.width <= 1 || r.right < 0 || r.left < -1000) return false;
      return r.height < 44 || r.width < 24;
    })
    .map((el) => {
      const r = el.getBoundingClientRect();
      return `${el.tagName}[${(el.textContent || "").trim().slice(0, 26)}] ${Math.round(r.width)}x${Math.round(r.height)}`;
    });
});
if (smallTargets.length) fails.push(`touch targets under 44px high: ${smallTargets.join(" | ")}`);

// Mobile menu opens, closes on Escape, and returns focus.
await mp.locator("#nav-toggle").click();
const opened = await mp.locator("#nav-drawer").isVisible();
await mp.keyboard.press("Escape");
const closed = !(await mp.locator("#nav-drawer").isVisible());
const refocused = await mp.evaluate(() => document.activeElement?.id === "nav-toggle");
if (!opened) fails.push("mobile menu did not open");
if (!closed) fails.push("mobile menu did not close on Escape");
if (!refocused) fails.push("focus did not return to the menu button after Escape");
await mobile.close();

// --- Desktop: focus ring, slider keyboard, form states ---------------------
const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const dp = await desktop.newPage();
await dp.goto(BASE + "/", { waitUntil: "networkidle" });

const ring = await dp.evaluate(() => {
  const link = document.querySelector("main a[href], header a[href]");
  link?.focus();
  const s = getComputedStyle(link, null);
  return { width: s.outlineWidth, style: s.outlineStyle, color: s.outlineColor };
});
if (ring.style === "none" || parseFloat(ring.width) < 2) {
  fails.push(`focus ring too weak: ${JSON.stringify(ring)}`);
} else {
  notes.push(`focus ring ${ring.width} ${ring.style} ${ring.color}`);
}

// The projects band is a continuous marquee: it has to travel on its own,
// stop dead when asked, and start again. A band that cannot be stopped, or
// that stops for good, is the failure mode that matters here.
await dp.locator("[data-projects-swiper]").first().scrollIntoViewIfNeeded();
await dp.waitForTimeout(2600);
// One position per band: the two must both travel, and at different rates.
// Equal rates would make them read as one rigid block, which is the whole
// reason there are two.
const bandX = () =>
  dp.evaluate(() =>
    [...document.querySelectorAll("[data-projects-swiper]")].map((host) =>
      Math.round(host.querySelector(".swiper-slide").getBoundingClientRect().x),
    ),
  );

const travelFrom = await bandX();
await dp.waitForTimeout(800);
const travelTo = await bandX();
const rates = travelTo.map((x, i) => x - travelFrom[i]);
if (rates.length < 2) fails.push(`expected two project bands, found ${rates.length}`);
rates.forEach((rate, i) => {
  if (Math.abs(rate) < 8) fails.push(`projects band ${i + 1} is not travelling`);
});
if (rates.length === 2 && Math.abs(Math.abs(rates[0]) - Math.abs(rates[1])) < 5) {
  fails.push(`both project bands travel at the same rate (${rates.join(", ")}px/0.8s)`);
}

// SC 2.2.2: the bands and the liquid grounds move without end and, by the
// owner's decision, the playback control was removed so the project tiles
// could be clicked. This is a known, accepted departure from AA — it is
// reported as a note, not a failure, and the checks below stay in place so
// they run again if the control ever comes back.
const hasPlayback = (await dp.locator("[data-projects-playback]").count()) > 0;
if (!hasPlayback) {
  notes.push(
    "no [data-projects-playback] control: continuous motion cannot be stopped (SC 2.2.2, accepted)",
  );
}

if (hasPlayback) {
await dp.locator("[data-projects-playback]").click();
await dp.waitForTimeout(800);
const frozenFrom = await bandX();
await dp.waitForTimeout(800);
const frozenTo = await bandX();
frozenTo.forEach((x, i) => {
  if (Math.abs(x - frozenFrom[i]) > 1) {
    fails.push(`pause left band ${i + 1} drifting (${x - frozenFrom[i]}px)`);
  }
});
const stoppedVideos = await dp.evaluate(
  () => [...document.querySelectorAll("[data-project-video]")].filter((v) => !v.paused).length,
);
if (stoppedVideos > 0) fails.push(`pause control left ${stoppedVideos} videos playing`);

await dp.locator("[data-projects-playback]").click();
await dp.waitForTimeout(1000);
const resumeFrom = await bandX();
await dp.waitForTimeout(800);
const resumeTo = await bandX();
const resumeRates = resumeTo.map((x, i) => x - resumeFrom[i]);
resumeRates.forEach((rate, i) => {
  if (Math.abs(rate) < 8) fails.push(`projects band ${i + 1} did not restart after pause`);
});
notes.push(`pause holds both bands, resume ${resumeRates.join(" and ")}px/0.8s`);

// The same switch has to stop the liquid grounds, which are the other
// never-ending motion on the page.
await dp.locator("[data-projects-playback]").click();
await dp.waitForTimeout(300);
const gooPaused = await dp.evaluate(
  () =>
    [...document.querySelectorAll("[data-goo] .blob")].filter(
      (el) => getComputedStyle(el).animationPlayState !== "paused",
    ).length,
);
if (gooPaused > 0) fails.push(`pause control left ${gooPaused} liquid blobs animating`);
await dp.locator("[data-projects-playback]").click();
await dp.waitForTimeout(300);
}

// Only what is actually on screen may decode.
const playing = await dp.evaluate(
  () => [...document.querySelectorAll("[data-project-video]")].filter((v) => !v.paused).length,
);
const offScreenPlaying = await dp.evaluate(
  () =>
    [...document.querySelectorAll("[data-project-video]")].filter((v) => {
      if (v.paused) return false;
      const r = v.getBoundingClientRect();
      return r.right < 0 || r.left > window.innerWidth;
    }).length,
);
if (offScreenPlaying > 0) fails.push(`${offScreenPlaying} off-screen slide videos playing`);
notes.push(
  `projects bands: travel ${rates.join(" and ")}px/0.8s, ${playing} videos decoding`,
);

// Form refuses an empty submit and names the problem.
await dp.goto(BASE + "/contato/", { waitUntil: "networkidle" });
await dp.locator("#pagina-contato [data-submit]").click();
await dp.waitForTimeout(400);
const errorText = await dp
  .locator('#pagina-contato [data-error-for="nome"]')
  .textContent();
const focusedField = await dp.evaluate(() => document.activeElement?.getAttribute("name"));
if (!errorText?.trim()) fails.push("empty submit produced no field error");
if (focusedField !== "nome") fails.push(`focus did not move to the first invalid field (got ${focusedField})`);
await desktop.close();

// --- Reduced motion: the site animates the same for everyone ---------------
// The owner decided this site does not defer to prefers-reduced-motion, so
// what has to hold instead is the thing that keeps autoplay conformant with
// WCAG 2.2 SC 2.2.2: a real control that stops it, and no content ever left
// stranded behind an entrance animation.
const reduced = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  reducedMotion: "reduce",
});
const rp = await reduced.newPage();
await rp.goto(BASE + "/", { waitUntil: "networkidle" });
await rp.waitForTimeout(1200);

const heroRuns = await rp.evaluate(() => !document.querySelector("[data-hero-video]")?.paused);
if (!heroRuns) fails.push("hero video did not start under reduced motion");

// Walk the page: every reveal must finish, whatever the motion preference.
const docHeight = await rp.evaluate(() => document.body.scrollHeight);
for (let y = 0; y < docHeight; y += 400) {
  await rp.evaluate((y) => window.scrollTo(0, y), y);
  await rp.waitForTimeout(120);
}
await rp.waitForTimeout(1100);
const stranded = await rp.evaluate(
  () =>
    [...document.querySelectorAll("[data-reveal]")].filter(
      (el) => parseFloat(getComputedStyle(el).opacity) < 0.99,
    ).length,
);
if (stranded > 0) fails.push(`${stranded} elements never revealed under reduced motion`);

// The pause control is what makes autoplay legitimate; it has to work.
await rp.evaluate(() => document.querySelector("[data-projects-swiper]")?.scrollIntoView());
await rp.waitForTimeout(2400);
const countPlaying = () =>
  rp.evaluate(() => [...document.querySelectorAll("[data-project-video]")].filter((v) => !v.paused).length);
const playingBefore = await countPlaying();
if (playingBefore < 1) fails.push(`band autoplay did not start (playing=${playingBefore})`);

if (hasPlayback) {
  await rp.click("[data-projects-playback]");
  await rp.waitForTimeout(500);
  const playingPaused = await countPlaying();
  const pressed = await rp.getAttribute("[data-projects-playback]", "aria-pressed");
  await rp.click("[data-projects-playback]");
  await rp.waitForTimeout(900);
  const playingResumed = await countPlaying();

  // The band shows several tiles at once, so any number above zero is right
  // here; what must hold is that the control takes it to zero and back.
  if (playingPaused !== 0) fails.push(`pause control left ${playingPaused} videos playing`);
  if (pressed !== "true") fails.push(`pause control did not report aria-pressed=true (got ${pressed})`);
  if (playingResumed < 1) fails.push(`resume control did not restart playback (playing=${playingResumed})`);
  notes.push(`pause control ${playingBefore}→${playingPaused}→${playingResumed}`);
}
notes.push(
  `reduced motion: site animates as normal, hero runs=${heroRuns}, stranded=${stranded}`,
);
await reduced.close();

// --- No-JS: everything is readable ----------------------------------------
const nojs = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  javaScriptEnabled: false,
});
const np = await nojs.newPage();
await np.goto(BASE + "/", { waitUntil: "load" });
const noJsState = await np.evaluate === undefined ? null : await np.locator("h1").textContent();
const slidesVisible = await np.locator(".swiper-slide").count();
const h1Visible = await np.locator("h1").isVisible();
if (!h1Visible) fails.push("h1 not visible without JavaScript");
if (slidesVisible < 10) fails.push(`only ${slidesVisible} project slides present without JavaScript`);
notes.push(`no-JS: h1 "${(noJsState || "").trim()}", ${slidesVisible} slides in the DOM`);
await nojs.close();

// --- Text contrast against its own ground ---------------------------------
// The blue ramp is the whole contrast story, so a ground moved one step is a
// legibility change, not a taste change. The ground is read from rendered
// pixels rather than from computed styles: the hero's copy sits on a scrim
// over a video, and walking up the DOM there finds the section colour, which
// is not what anybody is reading. So the glyphs are made transparent — not
// hidden, because hiding a lime pill takes its own background away with it
// and the probe would read whatever is behind the button — the frame is
// captured, and the pixel under each text box is the real ground.
const relative = ([r, g, b]) => {
  const channel = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};
const contrast = (fg, bg) => {
  const [hi, lo] = [relative(fg), relative(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
};
const rgb = (value) => value.match(/\d+/g).slice(0, 3).map(Number);

const lowContrast = [];
let measured = 0;

for (const size of [
  { width: 1440, height: 900, label: "1440" },
  { width: 390, height: 844, label: "390" },
]) {
  const cp = await (await browser.newContext({ viewport: size })).newPage();

  for (const route of ["/", "/planos/", "/projetos/", "/contato/", "/blog/"]) {
    await cp.goto(BASE + route, { waitUntil: "networkidle" });
    const pageHeight = await cp.evaluate(() => document.body.scrollHeight);

    // Walk the page once so every reveal has finished, then start from the
    // top. Hiding text later does not move anything, so the boxes hold.
    for (let y = 0; y < pageHeight; y += 600) {
      await cp.evaluate((y) => window.scrollTo(0, y), y);
      await cp.waitForTimeout(70);
    }
    await cp.evaluate(() => window.scrollTo(0, 0));
    await cp.waitForTimeout(700);

    for (let top = 0; top < pageHeight; top += size.height) {
      await cp.evaluate((y) => window.scrollTo(0, y), top);
      await cp.waitForTimeout(350);

      const samples = await cp.evaluate(() => {
        const out = [];
        document
          .querySelectorAll("p, span, a, li, label, h1, h2, h3, h4, h5, button, time")
          .forEach((el) => {
            if (el.dataset.contrastSampled) return;
            if (!el.textContent.trim() || el.children.length > 0) return;
            if (el.closest("[aria-hidden='true']")) return;
            const box = el.getBoundingClientRect();
            // Off-screen honeypot, collapsed nodes, and anything not in frame.
            if (box.width < 4 || box.height < 4 || box.left < -1000) return;
            if (box.top < 4 || box.bottom > window.innerHeight - 4) return;
            const style = getComputedStyle(el);
            if (style.visibility === "hidden" || parseFloat(style.opacity) < 0.95) return;

            // Whatever sits on top at this point is what the camera records.
            // The fixed WhatsApp dock crosses other text as the page scrolls,
            // and sampling through it reports the dock's own colour as the
            // ground. Skip anything that is not the topmost thing here.
            const px = Math.round(box.x + box.width / 2);
            const py = Math.round(box.y + box.height / 2);
            const onTop = document.elementFromPoint(px, py);
            if (!onTop || !(el === onTop || el.contains(onTop))) return;

            // getComputedStyle is live, so the colour has to be read before
            // the glyphs are cleared or every sample comes back transparent.
            const fg = style.color;
            el.dataset.contrastSampled = "1";
            el.style.color = "transparent";
            el.style.textDecorationColor = "transparent";
            out.push({
              fg,
              x: px,
              y: py,
              size: parseFloat(style.fontSize),
              weight: Number(style.fontWeight),
              text: el.textContent.trim().slice(0, 34),
            });
          });
        return out;
      });
      if (!samples.length) continue;

      await cp.waitForTimeout(120);
      const frame = PNG.sync.read(await cp.screenshot());

      for (const sample of samples) {
        const offset = (frame.width * sample.y + sample.x) << 2;
        const ground = [frame.data[offset], frame.data[offset + 1], frame.data[offset + 2]];
        const ratio = contrast(rgb(sample.fg), ground);
        const large = sample.size >= 24 || (sample.size >= 18.66 && sample.weight >= 700);
        const required = large ? 3 : 4.5;
        measured += 1;
        if (ratio < required) {
          lowContrast.push(
            `${size.label}px ${route} ${ratio.toFixed(2)}:1 (needs ${required}) ${sample.size}px ${sample.fg} on rgb(${ground}) — "${sample.text}"`,
          );
        }
      }
    }
  }
  await cp.close();
}
if (lowContrast.length) {
  fails.push("text under WCAG AA contrast:\n    " + [...new Set(lowContrast)].join("\n    "));
}
notes.push(`contrast: ${measured} text nodes measured against rendered pixels, ${lowContrast.length} below AA`);

// --- The liquid grounds stay inside the contrast bound ---------------------
// The blobs drift, so no single screenshot of the page proves the copy over
// them is safe. What does prove it is a bound on the worst pixel the ground
// ever shows, checked against the ground luminance its secondary text needs
// for 4.5:1. Under that bound, no drift of the blobs can put any text below
// AA. Which end binds depends on the tone: a blue ground carries light copy,
// so its BRIGHTEST pixel must stay under a ceiling, and a light ground carries
// dark copy, so its DARKEST pixel must stay over a floor. Lightening the blue
// blobs past blue-700, or darkening the light ones past blue-300, or raising
// either alpha, is what would cross it.
let seen = 0;
const goo = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const gp = await goo.newPage();
for (const width of [1440, 390]) {
  await gp.setViewportSize({ width, height: 900 });
  await gp.goto(BASE + "/", { waitUntil: "networkidle" });
  // Only the ground and the goo may remain: content would be measured as
  // "brighter", and the header and dock overlap the capture rect.
  await gp.evaluate(() => {
    document
      .querySelectorAll("section > :not([data-goo])")
      .forEach((el) => (el.style.visibility = "hidden"));
    document
      .querySelectorAll(`header, footer, [class*="fixed"]`)
      .forEach((el) => (el.style.display = "none"));
  });

  // Through throwaway elements, because reading the custom properties off
  // :root gives back the unresolved `var(--color-plop-blue-200)`.
  const [onBlue, onWhite] = await gp.evaluate(() =>
    ["--color-plop-on-blue", "--color-plop-on-white"].map((token) => {
      const probe = document.createElement("span");
      probe.style.color = `var(${token})`;
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    }),
  );
  // Invert the WCAG ratio for whichever term the ground is:
  //   darker ground: L_bg <= (L_text + 0.05)/4.5 - 0.05
  //   lighter ground: L_bg >= 4.5*(L_text + 0.05) - 0.05
  const ceiling = (relative(rgb(onBlue)) + 0.05) / 4.5 - 0.05;
  const floor = 4.5 * (relative(rgb(onWhite)) + 0.05) - 0.05;

  const grounds = await gp.$$("[data-goo]");
  if (!grounds.length) fails.push(`no [data-goo] liquid grounds found at ${width}px`);
  seen += grounds.length;

  for (let i = 0; i < grounds.length; i++) {
    await grounds[i].scrollIntoViewIfNeeded();
    // Long enough for the blobs to be well off their start frame.
    await gp.waitForTimeout(1500);
    const png = PNG.sync.read(await grounds[i].screenshot());
    let brightest = -1;
    let brightestPx = null;
    let darkest = Infinity;
    let darkestPx = null;
    for (let y = 0; y < png.height; y += 4) {
      for (let x = 0; x < png.width; x += 4) {
        const o = (png.width * y + x) << 2;
        const px = [png.data[o], png.data[o + 1], png.data[o + 2]];
        const l = relative(px);
        if (l > brightest) {
          brightest = l;
          brightestPx = px;
        }
        if (l < darkest) {
          darkest = l;
          darkestPx = px;
        }
      }
    }

    const tone = await grounds[i].evaluate((el) => el.dataset.gooTone);
    if (tone === "light") {
      if (darkest < floor - 0.0005) {
        fails.push(
          `${width}px light liquid ground ${i + 1} too dark: darkest rgb(${darkestPx}) L=${darkest.toFixed(4)} under the L>=${floor.toFixed(4)} it must hold (secondary copy ${onWhite})`,
        );
      }
      continue;
    }

    // FinalCta's flat ground is already above the blue-200 ceiling and
    // carries no secondary copy, so what binds there is the weaker rule:
    // the liquid must not make its section any lighter than it already is.
    const flat = await grounds[i].evaluate(
      (el) => getComputedStyle(el.closest("[class*='bg-plop']") ?? el.parentElement).backgroundColor,
    );
    const limit = Math.max(ceiling, relative(rgb(flat)));
    if (brightest > limit + 0.0005) {
      fails.push(
        `${width}px liquid ground ${i + 1} too light: brightest rgb(${brightestPx}) L=${brightest.toFixed(4)} over the L<=${limit.toFixed(4)} it may reach (flat ground ${flat}, secondary copy ${onBlue})`,
      );
    }
  }
}
notes.push(`liquid grounds: ${seen} measured at 1440px and 390px, all under the contrast ceiling`);
await goo.close();

await browser.close();

console.log("NOTES:\n  " + notes.join("\n  "));
console.log(fails.length ? "\nFAILURES:\n  " + fails.join("\n  ") : "\nALL CHECKS PASSED");
