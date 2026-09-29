# TYPE-CONTAINER.spec.md — portable responsive type + container spec

A self-contained description of how this project scales typography and page
width, written so it can be dropped into a **new** Astro + Tailwind CSS 4
project without reading anything else in this repository.

Everything here is Tailwind 4 + Astro. The only project-specific part is the
token prefix (`plop`) and the numbers; rename the prefix and re-tune the
numbers and the system is unchanged.

Companion documents in this repo: `STYLES.md` (the whole CSS architecture,
including component files and anti-patterns) and `DESIGN.md` (what the values
should *be*). This file is the exportable subset: the two responsive systems
and the wiring that makes them work.

---

## 1. The idea in one paragraph

There are exactly **two responsive knobs** on the page.

1. **`--text-html`** — the root font size. Every `rem` in the project resolves
   against it, so changing it at a breakpoint rescales type, spacing, radii
   and gaps proportionally, in one line.
2. **`--container-plop`** — the page's only max-width, consumed by exactly one
   class (`.shell`).

Everything else is derived. Headlines interpolate with the viewport through
`clamp()`; UI text steps through a fixed ramp; sections never own a width.
Both tokens are **responsive custom properties**, which in Tailwind 4 requires
a specific wiring recipe (§4) — get that wrong and the overrides compile
cleanly and do nothing.

---

## 2. Setup

Tailwind 4 through the official Vite plugin. No `@astrojs/tailwind`, no
`tailwind.config.js` — configuration is CSS.

```bash
npm i tailwindcss @tailwindcss/vite
```

```js
// astro.config.mjs
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: "auto" },
});
```

The stylesheet is imported **once**, from the base layout:

```astro
---
// src/layouts/BaseLayout.astro
import "../styles/global.css";
---
```

Never import it from a component: one import means one emitted stylesheet and
one cascade to reason about.

File layout for the two systems:

```text
src/styles/
  global.css                 @theme tokens, @theme inline registrations,
                             unlayered :root values, base element styles
  components/
    typography.css           the type scale + its per-breakpoint tuning
    layout.css               .shell, .measure, .eyebrow
```

`global.css` imports Tailwind, the fonts, then the component files:

```css
@import "tailwindcss";
@import "@fontsource-variable/quicksand/index.css";
@import "@fontsource-variable/manrope/index.css";

@import "components/typography.css";
@import "components/layout.css";
```

---

## 3. The cascade rule everything depends on

Tailwind 4 emits into named cascade layers:

```css
@layer theme, base, components, utilities;
```

`@theme { … }` tokens land in `@layer theme`, on `:root`.

> **An unlayered declaration beats any layered one, regardless of
> specificity.** That is a cascade rule, not a specificity trick.

So a plain, unlayered `:root { --container-plop: … }` overrides the value
`@theme` emitted, and an unlayered `html { --text-html: … }` overrides
whatever the theme said. That is exactly why `typography.css` is written
**outside any `@layer`**, and why the responsive values in `global.css` sit in
a bare `:root` rather than inside `@theme`.

Practical split:

| token kind | where to declare |
| --- | --- |
| static (colors, fonts, radii, easings, breakpoints) | `@theme` |
| responsive (type steps, container width) | name in `@theme inline`, value in an unlayered rule |

---

## 4. The responsive-token recipe

One pattern, used by both systems.

### 4.1 Register the name (compiled config)

```css
@theme inline {
  --container-plop: var(--container-plop);
  --text-h1: var(--text-h1);
  --text-h2: var(--text-h2);
  /* …one line per step… */
}
```

Read that as a **registration, not an assignment**. `@theme inline`
substitutes the token's *value* into the generated utility at build time —
and because the value is itself a `var()`, the utility ends up containing the
literal text `var(--text-h2)`:

```css
.text-h2 { font-size: var(--text-h2) }
.max-w-plop { max-width: var(--container-plop) }
```

A utility that reads the **live** variable at use time. Any unlayered
redeclaration, including one inside a media query, reaches every element using
it. Without `inline`, the value is frozen into the utility at build time and
breakpoint overrides never arrive.

### 4.2 Declare the values, unlayered

```css
:root {
  --container-plop: 1440px;      /* base = narrowest viewport */
  --gutter: clamp(20px, 4vw, 64px);

  /* …all other plain declarations first… */

  /* nested rules LAST, ascending width order */
  @variant xg  { --container-plop: 80%; }
  @variant lg  { --container-plop: 93%; }
  @variant 2xl { --container-plop: 1440px; }
}
```

Four rules make it work, and each one is a real failure mode:

**`@variant` must be nested inside a style rule.** It is not a rule of its
own — it wraps the declarations of its *parent* rule. At the top level of a
file there is no selector to attach them to, and Tailwind drops them
silently. This is the most common way to get a responsive token that compiles
cleanly and does nothing.

**Nested rules go after all plain declarations.** A plain declaration written
*after* a nested rule is a "mixed declaration"; browsers and bundlers have
handled those inconsistently. Keep every block shaped as
`declarations → nested rules`.

**Ascending width order.** `@variant` compiles to `min-width` queries, which
all match at wide viewports. Equal specificity means source order decides, so
a wider step must be written after the narrower one it refines.

**Redeclare only what changes.** A step that omits a token keeps the value
from the step above. The override list should read as a diff, not as a full
copy of the scale.

### 4.3 Breakpoints

`@variant` names come from the `--breakpoint-*` tokens, so custom steps behave
exactly like built-in ones. The set this project uses:

```css
@theme {
  --breakpoint-xs: 375px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-xg: 992px;    /* the tablet-to-laptop gap */
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1440px;  /* pulled in to match the shell's max width */
  --breakpoint-3xl: 1680px;
  --breakpoint-4xl: 1920px;
  --breakpoint-5xl: 2560px;
}
```

Two deliberate deviations from Tailwind's defaults: **`xg` (992px)** exists
because the tablet-to-laptop gap is where this layout actually changes, and
**`2xl` is pulled in from 1536px to 1440px** so the breakpoint and the shell's
max width are the same number — otherwise the container stops growing at a
width where no media query fires and the seam is invisible in the source.

Add a step only when the layout genuinely changes at that width. Every extra
breakpoint is a column in every future tuning table.

---

## 5. Responsive typography

Lives entirely in `components/typography.css`, unlayered. It is the only file
that decides how type responds to width. Three layers, coarsest to finest.

### 5.1 The root knob — `--text-html`

```css
html {
  --text-html: 16px;
  font-size: var(--text-html);
}
```

Every `rem` on the page resolves against this. Changing it at a breakpoint
rescales the whole page at that width, proportionally, in one line. The
current tuning table:

| step | width | `--text-html` |
| --- | --- | --- |
| base / xs / sm / md | ≤ 991px | 16px |
| xg | ≥ 992px | 12px |
| lg | ≥ 1024px | 13px |
| xl | ≥ 1280px | 14px |
| 2xl → 5xl | ≥ 1440px | 16px |

```css
html {
  /* …the ramps… */

  @variant xg  { --text-html: 12px; }
  @variant lg  { --text-html: 13px; }
  @variant xl  { --text-html: 14px; }
  @variant 2xl { --text-html: 16px; }
}
```

The shape of that table is the point: the page is at full scale on phones and
again on large desktops, and **pulled in through the laptop range**, where the
viewport is wide enough to invite a big layout but short enough that a
full-scale one stops fitting vertically. One line per width instead of a
per-component fix.

This is the blunt instrument. Reach for it when a width feels globally too big
or too small, never to fix one heading.

Two cautions. It moves *everything*, so test the result rather than trusting
the number. And a root size below the browser default overrides the reader's
own font-size preference — the 12px/13px steps here are a deliberate trade
for the laptop range, and if you port this table you should re-decide it
rather than copy it. Steps at or above 16px are the safe default.

### 5.2 The fluid display ramp

Headlines interpolate with the viewport instead of stepping, so they never sit
at an awkward size between breakpoints:

```css
--text-display: clamp(3.25rem, 7vw, 6.5rem);
--text-h1:      clamp(2.5rem, 4.3vw, 5.5rem);
--text-h2:      clamp(2.125rem, 3.6vw, 3.75rem);
--text-h3:      clamp(1.375rem, 2.2vw, 2rem);
--text-lead:    clamp(0.9rem, 1.3vw, 1.1rem);
```

Because the bounds are in `rem`, they ride `--text-html` as well — the two
systems compose rather than compete.

### 5.3 The fixed UI ramp

Labels, captions, metadata and card titles **step** rather than interpolate:
fluid UI text reads as unstable sitting next to fluid headlines.

```css
--text-h4: 1.625rem;
--text-h5: 1.375rem;
--text-ui-xl: 1.25rem;
--text-ui-lg: 1.125rem;
--text-article: 1.0625rem;
--text-base: 1rem;
--text-ui: 1rem;
--text-small: 0.8rem;
```

### 5.4 Consuming the scale

Every step is registered in `@theme inline`, so both forms work and both read
the live variable:

```html
<h2 class="text-h2">…</h2>
```

```css
.prose-plop h2 { font-size: clamp(var(--text-h4), 3vw, 2.25rem); }
```

Prefer the utility. The arbitrary-value form
(`text-[length:var(--text-h2)]`) resolves to the same thing and the Tailwind
language server will tell you to collapse it. Reach for `var(--text-*)` in
custom CSS only, as above, when a step needs to be composed into a `clamp()`.

**Never hardcode a `font-size` in a component.** A size worth using twice is
worth being a step.

### 5.5 Families and base element styles

Two variable faces, one file each — no synthesised bold and no second request
per weight:

```css
@theme {
  --font-display: "Quicksand Variable", system-ui, sans-serif;
  --font-sans: "Manrope Variable", system-ui, -apple-system, sans-serif;
}
```

The element defaults that pair with the scale:

```css
@layer base {
  body {
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: 500;
    line-height: 1.4;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
    font-weight: 700;
    line-height: 0.98;
    letter-spacing: -0.035em;
    text-wrap: balance;
  }

  p { text-wrap: pretty; }

  /* Prices, steps and counts read as measured values, not as prose. */
  [data-numeric] {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1;
  }
}
```

Note the two `text-wrap` lines: `balance` shapes headings into even lines,
`pretty` keeps paragraphs off orphans. Both are free and both are easy to
forget when porting.

---

## 6. The responsive container

One token, **one consumer**.

```css
/* global.css — unlayered */
:root {
  --container-plop: 1440px;
  --gutter: clamp(20px, 4vw, 64px);
  --section-space: clamp(80px, 10vw, 150px);

  @variant xg  { --container-plop: 80%; }
  @variant lg  { --container-plop: 93%; }
  @variant 2xl { --container-plop: 1440px; }
}
```

```css
/* components/layout.css */
@layer components {
  .shell {
    width: 100%;
    max-width: var(--container-plop);
    margin-inline: auto;
    padding-inline: var(--gutter);
  }
}
```

```astro
<section class="py-[var(--section-space)]">
  <div class="shell">…</div>
</section>
```

**`.shell` is the only element allowed to own the page's horizontal bounds.**
Sections are full-bleed and put a `.shell` inside; they never set their own
`max-width`. That way the site has exactly one width to re-tune, and a
full-bleed background never needs a second, inconsistent wrapper.

How to read the ramp: below 992px the page is full-bleed and the gutter alone
holds the margins. From 992px the shell takes a **percentage**, so the layout
breathes with the window through the laptop range. From 1440px it locks to a
fixed pixel width and the extra viewport becomes symmetric empty space,
because a measure that keeps growing past ~1440px stops being readable.

Mixing `px` and `%` across steps is fine, but **watch the seam**: a `%` step
produces a *smaller* box than the full-bleed width just below it, so the
layout jumps inward at that breakpoint. Verify the transition at the
breakpoint itself, not 200px either side of it.

`--gutter` is the paired token and is fluid rather than stepped — it has no
seam to defend.

### 6.1 The companions

Width is not only the container. Two more constraints do the rest:

```css
@layer components {
  .measure       { max-width: 62ch; }   /* body copy */
  .measure-tight { max-width: 48ch; }   /* lead paragraphs, cards */
}
```

`ch` units mean the measure tracks the font, so it survives any change to
`--text-html` or to the family without re-tuning.

And the two-column spine, the one structural grid the page descends:

```css
.spine-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(32px, 5vw, 72px);
}

@media (min-width: 1024px) {
  .spine-grid {
    grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
    gap: clamp(48px, 6vw, 112px);
  }
}
```

`minmax(0, …)` rather than a bare `fr`: without it a wide child (a table, a
`pre`, a video) refuses to shrink below its content and blows the grid out of
the viewport.

---

## 7. Anti-patterns

```css
/* ✗ @variant at the top level — no parent rule, silently dropped */
@variant lg { --container-plop: 93%; }

/* ✗ responsive value in @theme — compiled config, not a cascade participant */
@theme { --text-h1: 3rem; @variant lg { --text-h1: 5rem; } }

/* ✗ value baked into the utility, so overrides never reach it */
@theme inline { --container-plop: 1440px; }

/* ✗ descending order — the narrow step wins at every width */
@variant lg { … } @variant md { … }

/* ✗ plain declaration after a nested rule */
:root { @variant lg { … } --gutter: 2rem; }

/* ✗ one-off value that belongs to the scale */
.card-title { font-size: 21px; }

/* ✗ a second element claiming the page width */
.section { max-width: 1200px; }

/* ✗ px measure — stops tracking the font */
.lead { max-width: 640px; }
```

---

## 8. Verifying the wiring

The compiled CSS is the source of truth for whether the recipe worked:

```bash
npm run build
grep -o -E '.{0,60}--container-plop:[^;}]*' dist/_astro/*.css
grep -o -E '.{0,60}--text-html:[^;}]*'      dist/_astro/*.css
```

Expected shape — a base value plus one block per step:

```css
:root{--container-plop:1440px}
@media (width>=992px){:root{--container-plop:80%}}
@media (width>=1024px){:root{--container-plop:93%}}
@media (width>=1440px){:root{--container-plop:1440px}}
```

Diagnosis:

- media queries missing → the `@variant` blocks were dropped, see §4.2;
- the utility carries a literal length instead of `var(…)` → the
  `@theme inline` registration is missing, see §4.1;
- the override is present but loses → something declared the token inside
  `@theme` or a `@layer`, see §3.

Then check the seams in a browser **at the breakpoints themselves**: 375, 768,
992, 1024, 1280, 1440, 1920. And once at 200% browser zoom, which is where a
sub-16px `--text-html` step shows whether it is still readable.

---

## 9. Porting checklist

1. `npm i tailwindcss @tailwindcss/vite`, add the Vite plugin, set
   `build.inlineStylesheets: "auto"`.
2. Create `src/styles/global.css` with `@import "tailwindcss"`, and import it
   once from the base layout.
3. Declare the palette, the two font families and the `--breakpoint-*` steps
   in `@theme`.
4. Register every responsive token in `@theme inline`, self-referentially —
   the container and each type step.
5. Create `components/typography.css`, **unlayered**, with `--text-html`, the
   fluid display ramp, the fixed UI ramp and the `@variant` tuning table.
   Re-decide the sub-16px steps rather than copying them (§5.1).
6. Put `--container-*`, `--gutter` and `--section-space` in the unlayered
   `:root`; add `.shell`, `.measure`, `.measure-tight` in `@layer components`.
7. Build, grep the output (§8), confirm the media queries are there **before**
   writing any page CSS.
8. Rename the `plop` prefix to the new project's, in `@theme`, `@theme inline`
   and `:root` alike.
