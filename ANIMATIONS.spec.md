# ANIMATIONS.spec.md — portable motion system spec

A self-contained description of the motion system used in this project,
written so it can be dropped into a **new** Astro + Tailwind CSS 4 project
without reading anything else in this repository. Every file the system needs
is reproduced in full below.

The system is small on purpose: **one IntersectionObserver module, one CSS
file, a handful of tokens**. No GSAP, no animation library, no framework
island. The only optional dependency is `lenis` for smooth scrolling (§8).

Companion documents in this repo: `TYPE-CONTAINER.spec.md` (the type scale and
container, same wiring conventions), `STYLES.md` (the whole CSS architecture)
and `DESIGN.md` (what the motion should *feel* like for PLOP specifically).

---

## 1. The idea in one paragraph

Motion is split into **four independent modules**, each usable without the
others:

1. **Reveal** (`.anim` + `data-anim`) — elements fade/slide in when they enter
   the viewport. A 190-line vanilla JS module adds a class; CSS does all the
   animating. Behaviour is configured entirely through `data-*` attributes in
   the markup.
2. **Rotator** (`.rotator`) — a pure-CSS headline carousel. No timers in JS;
   the phasing comes from `animation-delay`. JS only pauses it off-screen.
3. **Page transitions** — cross-document View Transitions opted into in CSS.
   Zero JS.
4. **Smooth scroll** (Lenis) — eases wheel scrolling and in-page anchors, never
   hijacks the scroll.

All four share **one clock** (`--beat`) and **two easing curves**, declared as
tokens (§3). That shared clock is what keeps a page from looking like a pile of
unrelated effects.

---

## 2. Setup and file layout

Assumes Tailwind 4 through `@tailwindcss/vite` (see `TYPE-CONTAINER.spec.md`
§2). The CSS below uses native nesting and `@apply`, both of which work in any
file `@import`ed from the global stylesheet.

```text
src/
  styles/
    global.css                tokens (@theme + :root), view transitions
    components/
      animations.css          reveal system + rotator
      lenis.css               (optional) Lenis rules
  scripts/
    animations.js             reveal observer
    smooth-scroll.ts          (optional) Lenis wrapper
  layouts/
    BaseLayout.astro          imports global.css, boots the scripts
```

```css
/* global.css */
@import "tailwindcss";

@import "components/animations.css";
@import "components/lenis.css";   /* only if using §8 */
```

Boot once, from the base layout, in a bundled (non-`is:inline`) script so
Astro ships it as a deferred module:

```astro
<!-- src/layouts/BaseLayout.astro, end of <body> -->
<script>
  import animations from "../scripts/animations.js";
  import { initSmoothScroll } from "../scripts/smooth-scroll.ts"; // optional

  animations();
  initSmoothScroll();
</script>
```

> **Astro `<ClientRouter />` caveat.** This project uses *cross-document*
> view transitions (§9), so every navigation is a real page load and
> `animations()` runs again naturally. If the target project uses Astro's
> `<ClientRouter />` instead, the module script runs only once — wrap the boot
> in `document.addEventListener("astro:page-load", () => animations())`.

---

## 3. Tokens — the shared clock

```css
/* global.css */
@theme {
  /* Two curves for the whole site. */
  --ease-plop-out: cubic-bezier(0.22, 1, 0.36, 1);       /* exponential ease-out: entrances, hovers */
  --ease-plop-standard: cubic-bezier(0.4, 0, 0.2, 1);    /* material standard: long travel, exits */
}

:root {
  --duration-fast: 250ms;     /* state feedback: hover, border, colour */
  --duration-normal: 320ms;
  --duration-slow: 600ms;
  /* One clock. Every reveal, rail swap and hover on the page is a
     multiple of this beat, so nothing drifts against anything else. */
  --beat: 320ms;
}
```

Why the easings are in `@theme` and the durations in `:root`: `@theme`
registers `--ease-*` as Tailwind utilities (`ease-plop-out`), while the
durations are consumed through `var()` (`duration-[var(--duration-fast)]`) and
can be re-tuned per breakpoint like any unlayered token.

**Choosing the curve** — the one non-obvious rule:

- `--ease-plop-out` covers ~80% of the distance in the first fifth of its
  duration. Perfect for short travel (a 1.3rem reveal, a hover nudge): it
  feels instant and then settles.
- For **long travel** (hundreds of pixels, a view-transition morph) that same
  curve makes the element arrive immediately and then creep — the movement is
  never legible. Use `--ease-plop-standard`, which spends the time it is given.

**The beat rule.** Entrances and rail transitions run on multiples of `--beat`
(`calc(var(--beat) * 2)` = 640ms); immediate state feedback runs on
`--duration-fast`. Do not invent durations outside those two layers. Rename
the `plop` prefix to the new project's and re-tune the numbers; the rule is
the part to keep.

---

## 4. Reveal system — markup API

```html
<h2 class="anim" data-anim="bottom">Title</h2>
<p  class="anim" data-anim="bottom" data-delay="400">Lead copy</p>
<div class="anim anim-img" data-anim="bottom" data-once="true">
  <img src="…" width="800" height="600" alt="…" />
</div>
```

`.anim` opts the element in; `data-anim` picks the effect. Both are required —
`.anim` without `data-anim` is observed but never hidden, so it does nothing.

### 4.1 Effects (`data-anim`)

| value | effect | observer threshold |
| --- | --- | --- |
| `bottom` | fade + rise 1.3rem | 0.4 |
| `top` | fade + drop 1.3rem | 0.4 |
| `left` | fade + slide in from the left | 0.4 |
| `right` | fade + slide in from the right | 0.4 |
| `fade` | opacity only | 0.4 |
| `clip-bottom` / `clip-top` / `clip-left` / `clip-right` | `clip-path` wipe, no opacity change | 0 |

Non-clip effects wait until **40%** of the element is visible. Clip effects
fire on the **first visible pixel**: they never go through `opacity: 0`, so
there is nothing to protect against a premature trigger, and a wipe that
starts late looks like a lag.

> **PLOP status.** In this repository only `bottom` has keyframes in
> `animations.css`, because it is the only effect the design uses. The other
> values are wired in the JS but would just pop in. §6 gives the complete
> keyframe set — copy that, not the PLOP file, when porting.

### 4.2 Modifiers

| attribute / class | default | meaning |
| --- | --- | --- |
| `data-delay="300"` | `0` | ms to wait before adding `.anim-on` |
| `data-delay-mobile="150"` | — | overrides `data-delay` below 992px |
| `data-speed="0.8"` | `1` | duration in **seconds**, written inline as `animation-duration` |
| `data-once="true"` | `false` | animate once; `.anim-on` is never removed |
| `data-reset="top\|bottom\|both"` | always | when to reset on exit (see below) |
| `data-mobile="false"` | `true` | below 992px, show immediately with no animation |
| `.anim-img` | — | wait for the first `<img>` inside to load before animating |
| `.force` | — | animate on page load without waiting for the observer |

**Reset semantics.** By default an element **replays** every time it
re-enters: when it leaves the viewport completely, `.anim-on` is removed and
the element is hidden again (instantly, off screen). `data-reset` narrows that:

- `top` — reset only when it left through the top (scrolled past);
- `bottom` — reset only when it left through the bottom (scrolled back up);
- `both` — same as the default, stated explicitly.

`data-once="true"` beats `data-reset`. If an element with `data-once` leaves
the viewport **before** its delay elapsed, the pending timeout is cancelled so
it can fire again on the next entry instead of animating off-screen.

**Stagger** is written by hand with `data-delay` in steps of 150–200ms. There
is deliberately no automatic stagger: the markup shows the choreography.

```html
<p   class="anim" data-anim="bottom" data-delay="800">…</p>
<div class="anim" data-anim="bottom" data-delay="950">…</div>
<div class="anim" data-anim="bottom" data-delay="1100">…</div>
```

---

## 5. Reveal system — the JS module

`src/scripts/animations.js`, complete. Plain JS by history; it type-checks
fine renamed to `.ts` with `HTMLElement` annotations if the target project is
strict about it.

```js
/**
 * Animations module (IntersectionObserver)
 *
 * Markup:
 *  - class="anim" data-anim="bottom|top|left|right|fade"
 *  - class="anim" data-anim="clip-bottom|clip-top|clip-left|clip-right"
 *
 * data-attributes:
 *  - data-delay="300"         -> ms before .anim-on is added
 *  - data-delay-mobile="150"  -> delay override below MOBILE_MAX
 *  - data-speed="0.8"         -> duration in seconds
 *  - data-once="true"         -> animate once (.anim-on is never removed)
 *  - data-mobile="false"      -> no animation on mobile (shown at once)
 *  - data-reset="top|bottom|both"
 *                              -> when to reset after leaving the viewport
 *
 * Notes:
 *  - .anim-img waits for its <img> to load before animating.
 *  - .force animates on page load without waiting for the observer.
 *  - threshold 0.4 triggers entry; threshold 0 detects a real exit
 *    (isIntersecting stays true while a single pixel is visible).
 */
function animations () {
  const animations = document.querySelectorAll('.anim')
  if (animations.length === 0) return

  const ANIM_THRESHOLD = 0.4
  const MOBILE_MAX = 992
  const pendingTimeouts = new WeakMap()

  // Cache the mobile check; recalculate only on (debounced) resize.
  let isMobile = window.innerWidth < MOBILE_MAX
  let resizeTimeout
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      isMobile = window.innerWidth < MOBILE_MAX
    }, 150)
  }, { passive: true })

  const clearPending = (element) => {
    const id = pendingTimeouts.get(element)
    if (id == null) return
    clearTimeout(id)
    pendingTimeouts.delete(element)
  }

  const applyAnimation = (element, once = false, observer = null) => {
    const delay = parseInt(isMobile && element.dataset.delayMobile != null ? element.dataset.delayMobile : element.dataset.delay, 10) || 0
    const speed = element.dataset.speed ? element.dataset.speed + 's' : '1s'

    const run = () => {
      pendingTimeouts.delete(element)
      element.style.animationDuration = speed
      element.classList.add('anim-on')
      if (once && observer) observer.unobserve(element)
    }

    clearPending(element)

    if (delay > 0) {
      pendingTimeouts.set(element, setTimeout(run, delay))
    } else {
      run()
    }
  }

  const handleImageAnimation = (element, once, observer) => {
    const img = element.querySelector('img')
    if (!img || img.complete) {
      applyAnimation(element, once, observer)
      return
    }
    img.addEventListener('load', () => applyAnimation(element, once, observer), { once: true })
  }

  const shouldAnimate = (element) => {
    const mobile = element.dataset.mobile ?? 'true'
    return mobile === 'true' || !isMobile
  }

  const isClipAnim = (element) => (element.dataset.anim ?? '').startsWith('clip')

  // Without data-reset, always reset. Otherwise reset only for the exit side asked for.
  const shouldReset = (element, boundingRect) => {
    const reset = element.dataset.reset
    if (!reset) return true

    const exitedTop = boundingRect.bottom < 0
    const exitedBottom = boundingRect.top > window.innerHeight

    if (reset === 'top' && exitedTop) return true
    if (reset === 'bottom' && exitedBottom) return true
    if (reset === 'both') return true
    return false
  }

  const resetAnimation = (element) => {
    clearPending(element)
    element.classList.remove('anim-on')
    element.style.removeProperty('opacity')
  }

  const triggerAnim = (entries, observer) => {
    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i]
      const element = entry.target
      const once = element.dataset.once === 'true'

      if (entry.isIntersecting) {
        const ready = isClipAnim(element) || entry.intersectionRatio >= ANIM_THRESHOLD
        if (!ready) continue
        if (!shouldAnimate(element)) continue
        if (element.classList.contains('anim-on')) continue

        if (element.classList.contains('anim-img')) {
          handleImageAnimation(element, once, observer)
        } else {
          applyAnimation(element, once, observer)
        }
      } else if (once) {
        // data-once: never remove .anim-on. If it has not run yet, cancel the
        // delay so it can fire again on the next entry.
        if (!element.classList.contains('anim-on')) clearPending(element)
      } else if (shouldReset(element, entry.boundingClientRect)) {
        resetAnimation(element)
      }
    }
  }

  // Two thresholds: 0 to detect a real exit, 0.4 to trigger the entry.
  const observer = new IntersectionObserver(triggerAnim, {
    root: null,
    rootMargin: '0px',
    threshold: [0, ANIM_THRESHOLD]
  })

  // Clip elements trigger on the first visible pixel.
  const clipObserver = new IntersectionObserver(triggerAnim, {
    root: null,
    rootMargin: '0px',
    threshold: 0
  })

  animations.forEach(element => {
    // data-mobile="false" on mobile: show at once, no animation.
    if (isMobile && !shouldAnimate(element)) {
      element.style.animationDuration = '0s'
      element.classList.add('anim-on')
      return
    }

    if (isClipAnim(element)) {
      clipObserver.observe(element)
    } else {
      observer.observe(element)
    }
  })

  document.querySelectorAll('.force').forEach(element => {
    if (!shouldAnimate(element)) return
    if (element.classList.contains('anim-img')) {
      handleImageAnimation(element, false, null)
    } else {
      applyAnimation(element, false, null)
    }
  })
}

export default animations
```

Design choices worth keeping when porting:

- **One observer per threshold set, not per element.** Two observers for the
  whole page, whatever the element count.
- **`WeakMap` for pending timeouts.** A delayed reveal that scrolls out before
  it fires is cancelled, not left to animate an invisible element.
- **The duration is written inline.** `data-speed` becomes
  `style.animationDuration`, which beats the stylesheet. Consequence: the
  effective default is **1s** (the JS fallback), not the 0.8s in the CSS; the
  CSS value only matters if the script never sets one.
- **The resize check is debounced and cached** so the observer callback never
  reads layout.
- **`MOBILE_MAX` must match the CSS** (`max-width: 991.98px` in §6). In the
  PLOP file the CSS says `992px`, which disagrees with the JS at exactly
  992px — harmless, but use the `.98` form in a new project.

---

## 6. Reveal system — the CSS

`src/styles/components/animations.css`, **complete keyframe set**. The PLOP
file ships `bottom` only; the rest follow the same shape and distance.

```css
/* ============================================================================
   0. REDUCED MOTION — opt-in (see §10)
   ============================================================================ */
/* @media (prefers-reduced-motion: reduce) {
  .anim[data-anim] {
    opacity: 1 !important;
    clip-path: none !important;
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
} */


/* ============================================================================
   1. BASE — fade/slide effects
   ============================================================================ */

/* Hidden until activated. No opacity transition on purpose: removing .anim-on
   off screen resets instantly, and nothing fights the keyframes on re-entry. */
.anim[data-anim]:not([data-anim^="clip"]) {
  opacity: 0;

  &.anim-on {
    opacity: 1;
    animation-duration: 0.8s;
    animation-timing-function: ease;
    animation-fill-mode: both;
  }
}

/* Inline spans cannot be transformed; promote them. */
span[data-anim] {
  @apply inline-flex gap-1;
}

/* Must match MOBILE_MAX in animations.js. */
@media (max-width: 991.98px) {
  .anim[data-anim][data-mobile="false"] {
    opacity: 1;
  }
}

.anim[data-anim="bottom"].anim-on { animation-name: AnimBottom; }
.anim[data-anim="top"].anim-on    { animation-name: AnimTop; }
.anim[data-anim="left"].anim-on   { animation-name: AnimLeft; }
.anim[data-anim="right"].anim-on  { animation-name: AnimRight; }
.anim[data-anim="fade"].anim-on   { animation-name: AnimFade; }

@keyframes AnimBottom {
  0%   { opacity: 0; transform: translateY(1.3rem); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes AnimTop {
  0%   { opacity: 0; transform: translateY(-1.3rem); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes AnimLeft {
  0%   { opacity: 0; transform: translateX(-1.3rem); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes AnimRight {
  0%   { opacity: 0; transform: translateX(1.3rem); }
  100% { opacity: 1; transform: translateX(0); }
}

@keyframes AnimFade {
  0%   { opacity: 0; }
  100% { opacity: 1; }
}


/* ============================================================================
   2. CLIP — wipe effects (never touch opacity)
   ============================================================================ */

.anim[data-anim="clip-bottom"]:not(.anim-on) { clip-path: inset(100% 0 0 0); }
.anim[data-anim="clip-top"]:not(.anim-on)    { clip-path: inset(0 0 100% 0); }
.anim[data-anim="clip-left"]:not(.anim-on)   { clip-path: inset(0 100% 0 0); }
.anim[data-anim="clip-right"]:not(.anim-on)  { clip-path: inset(0 0 0 100%); }

.anim[data-anim^="clip"].anim-on {
  animation-duration: 0.8s;
  animation-timing-function: var(--ease-plop-out);
  animation-fill-mode: both;
}

.anim[data-anim="clip-bottom"].anim-on { animation-name: AnimClipBottom; }
.anim[data-anim="clip-top"].anim-on    { animation-name: AnimClipTop; }
.anim[data-anim="clip-left"].anim-on   { animation-name: AnimClipLeft; }
.anim[data-anim="clip-right"].anim-on  { animation-name: AnimClipRight; }

@keyframes AnimClipBottom { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0); } }
@keyframes AnimClipTop    { from { clip-path: inset(0 0 100% 0); } to { clip-path: inset(0); } }
@keyframes AnimClipLeft   { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0); } }
@keyframes AnimClipRight  { from { clip-path: inset(0 0 0 100%); } to { clip-path: inset(0); } }
```

Naming of the clip directions follows the fade effects: `clip-bottom` reveals
**from** the bottom edge upwards.

### 6.1 Composing with Tailwind transforms

Tailwind 4's `translate-*`, `scale-*` and `rotate-*` utilities write the
individual `translate` / `scale` / `rotate` properties, **not** `transform`.
The keyframes animate `transform`, so the two compose: an element can carry a
resting offset and still reveal.

```html
<!-- Rests 8rem lower and still rises 1.3rem into that position. -->
<p class="anim translate-y-[8rem]" data-anim="bottom" data-delay="1400">…</p>
```

Do not write `transform: …` on an `.anim` element in custom CSS — the
keyframes would overwrite it for their duration and snap back at the end.

---

## 7. Rotator — pure-CSS headline carousel

Three phrases stacked in one grid cell, so the box always measures the tallest
one and the cycle never shifts the content below it (zero CLS). Each term runs
**one infinite animation** lasting the whole cycle; what differs between terms
is only the **phase**, set with `animation-delay`. No JS timers.

### 7.1 Markup

```html
<h1 class="rotator" data-rotator>
  <span class="rotator-phrase" data-anim="bottom">
    <span class="rotator-term rotator-term--break">Seu negócio</span>
    <span class="rotator-term">está</span>
    <span class="rotator-term text-plop-lime">online?</span>
  </span>
  <span class="rotator-phrase" data-anim="bottom">…</span>
  <span class="rotator-phrase" data-anim="bottom">…</span>
</h1>
```

`data-anim` on the phrase picks the direction (`bottom` enters from below and
exits upwards; `top` the opposite). The phrases do **not** carry `.anim`:
there is nothing to observe, the cycle starts with the page. That also means
the headline is never hidden waiting on JS — important when it is the LCP
element.

### 7.2 CSS

```css
.rotator {
  /* 48 beats per cycle, 16 per phrase: ~5.1s turn, ~3.6s of it still. */
  --rot-cycle: calc(48 * var(--beat));
  --rot-phrase: calc(16 * var(--beat));
  --rot-step: calc(var(--beat) / 2);
  --rot-travel: 0.4em;
  /* Inter-term space is painted here, not in the markup: Astro's
     `compressHTML` strips whitespace between tags at build time. Tune to the
     display face's space width minus the heading's word-spacing. */
  --rot-gap: 0.16em;

  display: grid;
}

/* Must come after `span[data-anim]` (§6), which would otherwise make the
   phrase inline-flex and break both the stacking and `text-wrap: balance`. */
.rotator > .rotator-phrase {
  display: block;
  grid-area: 1 / 1;
}

.rotator > .rotator-phrase:nth-child(2) { --p: 1; }
.rotator > .rotator-phrase:nth-child(3) { --p: 2; }

.rotator-term {
  /* inline-block, not a flex item: line breaking stays the browser's. */
  display: inline-block;
  animation-duration: var(--rot-cycle);
  animation-iteration-count: infinite;
  animation-fill-mode: both;
  animation-timing-function: linear; /* each segment sets its own curve */
  /* The trailing subtraction removes the idle lead-in of the first turn, so
     the headline starts entering with the page instead of sitting blank for
     half a second (which would be half a second of LCP). */
  animation-delay: calc(
    var(--rot-phrase) * var(--p, 0) + var(--rot-step) * var(--t, 0) -
      var(--rot-phrase) / 10
  );
  /* Running by default: if the pause script never loads, it keeps cycling
     rather than freezing on a term that already faded out. */
  animation-play-state: var(--rot-state, running);
}

/* A margin gives the gap without costing a line-break opportunity. */
.rotator-term:not(:last-child) { margin-inline-end: var(--rot-gap); }

/* Forces every phrase onto the same line count, so the box (sized by the
   tallest phrase) never leaves an empty half-line under a short one. */
.rotator-term--break { display: block; }

.rotator-term:nth-child(2) { --t: 1; }
.rotator-term:nth-child(3) { --t: 2; }
.rotator-term:nth-child(4) { --t: 3; }

.rotator-phrase[data-anim="bottom"] .rotator-term { animation-name: RotatorBottom; }
.rotator-phrase[data-anim="top"] .rotator-term    { animation-name: RotatorTop; }

/* 0 → 3.333%  wait (one tenth of a phrase turn)
   3.333 → 7.5% enter (640ms)
   7.5 → 31.25% hold
   31.25 → 33.333% exit (320ms), exactly at the end of the phrase's turn.
   The initial wait is what keeps hand-offs clean: the last term of the
   outgoing phrase finishes leaving before the first incoming one appears. */
@keyframes RotatorBottom {
  0%, 3.333% {
    opacity: 0;
    transform: translateY(var(--rot-travel));
    animation-timing-function: var(--ease-plop-out);
  }
  7.5% { opacity: 1; transform: translateY(0); }
  31.25% {
    opacity: 1;
    transform: translateY(0);
    animation-timing-function: var(--ease-plop-standard);
  }
  33.333%, 100% {
    opacity: 0;
    transform: translateY(calc(var(--rot-travel) * -1));
  }
}

@keyframes RotatorTop {
  0%, 3.333% {
    opacity: 0;
    transform: translateY(calc(var(--rot-travel) * -1));
    animation-timing-function: var(--ease-plop-out);
  }
  7.5% { opacity: 1; transform: translateY(0); }
  31.25% {
    opacity: 1;
    transform: translateY(0);
    animation-timing-function: var(--ease-plop-standard);
  }
  33.333%, 100% {
    opacity: 0;
    transform: translateY(var(--rot-travel));
  }
}
```

**No `overflow: clip` on the phrase.** Headings at `line-height` below 1 have
line boxes shorter than the em, so a clip would cut accents and descenders.
Terms travel and fade; they do not hide behind an edge.

**Changing the phrase count** means changing the percentages: they are the
beat count seen from the cycle (`16/48 = 33.333%`, etc.). For N phrases,
`--rot-cycle = 16 * N * beat` and every percentage scales by `3 / N`.

### 7.3 Pausing off screen

The cycle is infinite, so it must not spend frames while off screen or in a
background tab. JS does not time the rotator; it only flips the play state.

```ts
const rotator = document.querySelector<HTMLElement>("[data-rotator]");

if (rotator) {
  let onScreen = true;

  const sync = () => {
    if (onScreen && !document.hidden) rotator.style.removeProperty("--rot-state");
    else rotator.style.setProperty("--rot-state", "paused");
  };

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(
      (entries) => {
        onScreen = entries[entries.length - 1].isIntersecting;
        sync();
      },
      { threshold: 0 },
    ).observe(rotator);
  }

  document.addEventListener("visibilitychange", sync);
}
```

The same pattern (IntersectionObserver + `visibilitychange`, gated through a
single `sync`/`resume` function) applies to **any** infinite animation or
background video on the page.

---

## 8. Smooth scroll (optional) — Lenis

```bash
npm i lenis
```

`src/styles/components/lenis.css`:

```css
html.lenis,
html.lenis body { height: auto; }

.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-stopped { overflow: hidden; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
```

`src/scripts/smooth-scroll.ts`:

```ts
import Lenis from "lenis";

let lenis: Lenis | null = null;

/** Exposed so other modules can pause the scroll (a modal, a locked drawer). */
export const getLenis = () => lenis;

export function initSmoothScroll(): void {
  lenis = new Lenis({
    duration: 0.9,                              // longer starts to feel like hijacking
    easing: (t: number) => 1 - Math.pow(1 - t, 4),
    syncTouch: false,                           // touch scrolls natively: no added latency
    touchMultiplier: 1,
    respectReducedMotion: false,                // see §10 — set per project
  });

  const frame = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  wireAnchors();
  landOnInitialHash(lenis);
}

/** Scroll to a section by id — the one way the whole site does it. */
export function scrollToSection(
  target: HTMLElement,
  { immediate = false }: { immediate?: boolean } = {},
): void {
  if (lenis) {
    // Measured against window.scrollY rather than handing Lenis the element:
    // Lenis resolves elements against its own animated scroll, which is stale
    // for a frame after any scroll it did not drive.
    lenis.scrollTo(target.getBoundingClientRect().top + window.scrollY, {
      immediate,
      offset: 0,
    });
  } else {
    target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }

  // Focus follows the eye, so keyboard users continue from the new section.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

/** The hash a link asks for, only when it points into the current page. */
export function samePageHash(link: HTMLAnchorElement): string | null {
  if (!link.hash || link.hash.length <= 1) return null;
  if (link.target && link.target !== "_self") return null;
  if (link.origin !== window.location.origin) return null;
  if (link.pathname !== window.location.pathname) return null;
  return link.hash;
}

// While Lenis holds the position, the browser's own fragment jump is
// overwritten on the next frame, so in-page links are handled explicitly.
function wireAnchors(): void {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>("a[href]");
    if (!link) return;

    const hash = samePageHash(link);
    if (!hash) return;

    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;

    event.preventDefault();
    // The skip link saves time; easing it would cost a second.
    const immediate = link.matches(".sr-only, [data-scroll-immediate]");
    scrollToSection(target, { immediate });
    history.replaceState(null, "", hash);
  });
}

// Arriving at /#section from another page: re-issue the jump through Lenis,
// instantly, so it agrees with the position the browser already chose.
function landOnInitialHash(instance: Lenis | null): void {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;

  requestAnimationFrame(() => {
    instance?.resize();
    scrollToSection(target, { immediate: true });
  });
}
```

Rules that make Lenis coexist with the rest of the page:

- **Mount on the document, never on a transformed wrapper.** `position:
  sticky`, `IntersectionObserver` (and therefore the whole reveal system) keep
  working untouched.
- **Scrollable boxes inside the page** (modals, drawers) carry
  `data-lenis-prevent`, and while a modal is open call
  `getLenis()?.stop()` / `.start()`.
- If the project uses `trailingSlash: "always"`, root-relative nav links like
  `/#planos` still count as same-page on `/`, which is what `samePageHash`
  relies on.

---

## 9. Page transitions — cross-document View Transitions

Pure CSS, in `global.css`. Same-origin navigations cross-fade; the document
still loads normally, so nothing needs re-initialising and no JS ships.

```css
@view-transition { navigation: auto; }

/* Named groups (elements with view-transition-name) morph with the
   standard curve — long travel, see §3. */
::view-transition-group(*) {
  animation-duration: 380ms;
  animation-timing-function: var(--ease-plop-standard);
}

@keyframes vt-enter { from { opacity: 0; transform: translateY(14px); } }
@keyframes vt-leave { to { opacity: 0; } }
@keyframes vt-root-in  { from { opacity: 0; } }
@keyframes vt-root-out { to { opacity: 0; } }

/* Arrivals are authored (rise + fade) because a snapshot is clipped to the
   viewport: an element that was off screen has no old position to morph from
   and would otherwise just appear. Leaving is faster than arriving. */
::view-transition-new(*) { animation: vt-enter 380ms var(--ease-plop-standard) both; }
::view-transition-old(*) { animation: vt-leave var(--duration-fast) var(--ease-plop-standard) both; }

/* `*` also matches root: put the root back to a plain cross-fade. */
::view-transition-group(root) { animation-duration: var(--duration-fast); }
::view-transition-new(root) { animation: vt-root-in var(--duration-fast) var(--ease-plop-standard) both; }
::view-transition-old(root) { animation: vt-root-out var(--duration-fast) var(--ease-plop-standard) both; }

/* Reduced motion removes the travel, keeps the cross-fade. */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*) { animation: none; }
  ::view-transition-new(*) { animation: vt-root-in var(--duration-fast) var(--ease-plop-standard) both; }
  ::view-transition-old(*) { animation: vt-root-out var(--duration-fast) var(--ease-plop-standard) both; }
}
```

The PLOP names are `plop-row-enter` / `plop-row-leave` / `plop-root-in` /
`plop-root-out`; rename freely.

---

## 10. Reduced motion — a per-project decision

**PLOP deliberately does not respond to `prefers-reduced-motion`** in the
reveal, Lenis, videos or rotator. It was an explicit owner decision, recorded
in `DESIGN.md`, with a known WCAG 2.2 trade-off (SC 2.2.2 for the infinite
motion). The view transitions are the one exception (§9).

**Do not inherit that decision by copying files.** For a new project, the
default recommendation is to honour the setting:

1. Uncomment the block at the top of `animations.css` (§6). Reveal content
   then renders visible and static.
2. Set `respectReducedMotion: true` in Lenis (its own default).
3. Stop the rotator on the first phrase:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .rotator-term { animation: none; }
     .rotator > .rotator-phrase:not(:first-child) { visibility: hidden; }
   }
   ```
4. For infinite motion that stays on, provide a visible pause control.

What reduced motion asks to remove is **travel** (the vestibular trigger), not
feedback. Opacity cross-fades are fine; slides, parallax and eased scroll
tails are what go.

---

## 11. Rules of use

- **Never put `.anim` on the LCP element.** It stays at `opacity: 0` until the
  deferred module runs and the delay elapses. In PLOP the hero `h1` is the
  rotator (never hidden) and only the secondary copy carries `.anim`.
- **Content must survive without JS.** The PLOP CSS hides `.anim` elements
  unconditionally, so a failed script leaves them invisible. For a new
  project, gate the hidden state behind a class set before first paint:
  ```astro
  <!-- <head>, before the stylesheet matters -->
  <script is:inline>document.documentElement.classList.add("js")</script>
  ```
  and prefix the hidden-state selectors in §6 with `.js ` (e.g.
  `.js .anim[data-anim]:not([data-anim^="clip"]) { opacity: 0 }`, and the
  same for the four `clip-*:not(.anim-on)` rules).
- **Reserve the space.** Reveals animate `opacity`, `transform` and
  `clip-path` only — none of them affect layout, so the system introduces no
  CLS. Keep it that way: never reveal by animating `height`, `margin` or
  `top`.
- **Animate sections, not every element.** Heading → lead → CTA, staggered, is
  the pattern. A reveal on every card, icon and list item turns motion into
  noise.
- **`.anim-img` needs intrinsic dimensions** on the `<img>` (`width`/`height`),
  otherwise the box is zero-height until load and the 40% threshold is
  meaningless.
- **Durations come from the beat.** `data-speed` and `data-delay` values should
  be readable as beat multiples (0.64s, 320ms…) or deliberate stagger steps.

---

## 12. Anti-patterns

```html
<!-- ✗ .anim without data-anim — observed, never hidden, does nothing -->
<div class="anim">…</div>

<!-- ✗ reveal on the LCP headline -->
<h1 class="anim" data-anim="bottom" data-delay="600">…</h1>

<!-- ✗ custom transform on a revealed element — overwritten by the keyframes -->
<div class="anim" data-anim="bottom" style="transform: rotate(3deg)">…</div>

<!-- ✗ rotator phrases wrapped in .anim — they would be hidden until observed -->
<span class="rotator-phrase anim" data-anim="bottom">…</span>
```

```css
/* ✗ opacity transition on the base state — fights the keyframes on re-entry */
.anim[data-anim] { transition: opacity .3s; }

/* ✗ duration outside the clock */
.card { transition-duration: 470ms; }

/* ✗ ease-out curve for long travel — arrives instantly, then creeps */
::view-transition-group(*) { animation-timing-function: var(--ease-plop-out); }

/* ✗ overflow clip on a rotator phrase with line-height < 1 — cuts accents */
.rotator-phrase { overflow: clip; }
```

```js
// ✗ one IntersectionObserver per element
els.forEach(el => new IntersectionObserver(cb).observe(el))

// ✗ JS timing an infinite CSS animation instead of pausing it
setInterval(nextPhrase, 5000)
```

---

## 13. Porting checklist

1. Add the tokens from §3 to `global.css` (`@theme` for easings, `:root` for
   durations and `--beat`). Rename the `plop` prefix.
2. Create `src/styles/components/animations.css` from §6 (**full** keyframe
   set, not the PLOP file) and `@import` it from `global.css`.
3. Create `src/scripts/animations.js` from §5 and boot it from the base
   layout's bundled `<script>` (§2). Using `<ClientRouter />`? Boot on
   `astro:page-load`.
4. Decide reduced motion (§10) and the no-JS gate (§11) **now**, before any
   page uses `.anim`.
5. Optional: add the rotator (§7) with its pause script; re-derive the
   keyframe percentages if the phrase count is not 3.
6. Optional: `npm i lenis`, add §8's CSS and module, mark scrollable overlays
   with `data-lenis-prevent`.
7. Optional: add §9's view-transition block.
8. Verify in a browser: scroll down and back up (reset behaviour), a
   `data-once` element, a `data-delay` element scrolled past quickly (must not
   animate off screen), 375px with `data-mobile="false"`, the OS reduced-motion
   toggle, and a load with JS disabled.
