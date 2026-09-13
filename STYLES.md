# STYLES.md — CSS architecture

How CSS is organised in this project, and the two responsive-token systems it
runs on: the **type scale** and the **container width**.

This file is written to be portable. Everything below is Tailwind CSS 4 +
Astro and carries no PLOP-specific assumption beyond the token names, so it
can be copied into a new project and re-tuned by renaming the tokens.

For *what* the values should be (palette, type, spacing), see `DESIGN.md`.
This file only describes *how* the system is wired.

## 1. Setup

Tailwind 4 through the official Vite plugin. No `@astrojs/tailwind`, no
`tailwind.config.js` — configuration is CSS.

```js
// astro.config.mjs
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: { plugins: [tailwindcss()] },
  build: { inlineStylesheets: "auto" },
});
```

The stylesheet is imported exactly once, in the base layout:

```astro
---
// src/layouts/BaseLayout.astro
import "../styles/global.css";
---
```

Never import `global.css` from a component. One import means one emitted
stylesheet and one cascade to reason about.

## 2. File layout

```text
src/styles/
  global.css            tokens, base element styles, global utilities
  components/
    typography.css      the type scale and its per-breakpoint tuning
    layout.css          .shell, .spine-grid, .measure, .eyebrow
    buttons.css         .btn and its variants
    prose.css           long-form article surface
    animations.css      reveal system + keyframes
    scrollbars.css   lenis.css   card-swiper.css
```

`global.css` is the only entry point. It imports Tailwind, the fonts and then
every component file, in that order:

```css
@import "tailwindcss";
@import "@fontsource-variable/quicksand/index.css";
@import "components/typography.css";
/* …the rest… */
```

Rule of thumb for the split: anything with its own selector family gets a
file under `components/`. `global.css` keeps tokens, `@layer base` element
styles and `@layer utilities` helpers — nothing else.

## 3. The cascade model

This is the single most important thing to understand before touching a
token, because both responsive systems depend on it.

Tailwind 4 emits everything into named cascade layers:

```css
@layer theme, base, components, utilities;
```

- `@theme { … }` tokens land in `@layer theme`, on `:root`.
- `@layer base` holds the preflight reset and our element styles.
- Utilities land in `@layer utilities`.

**An unlayered declaration beats any layered one, regardless of
specificity.** That is a cascade rule, not a specificity trick: layered
styles always lose to unlayered styles in the same origin.

So a plain, unlayered `:root { --text-h2: … }` overrides the `--text-h2`
that `@theme` emitted, and `html { --text-html: … }` in `typography.css`
overrides whatever `@theme` said. That is deliberate, and it is why
`typography.css` writes its rules outside any `@layer`.

Practical consequence:

- **Static** token → declare it in `@theme`.
- **Responsive** token → register the name in `@theme inline`, declare the
  values in an unlayered rule.

## 4. `@theme` vs `@theme inline`

`@theme` emits the token *and* makes generated utilities reference it as
`var(--token)`.

`@theme inline` substitutes the token's **value** into the utility at build
time instead of referencing it. Which sounds like the opposite of what we
want — until the value itself is a `var()`:

```css
@theme inline {
  --text-h2: var(--text-h2);
  --container-plop: var(--container-plop);
}
```

Read that as a registration, not an assignment. It tells Tailwind two things:

1. the name exists, so emit the utilities for it (`text-h2`, `max-w-plop`);
2. those utilities should contain the literal text `var(--text-h2)`.

The result is `.text-h2 { font-size: var(--text-h2) }` — a utility that reads
the **live** variable at use time. Any unlayered redeclaration of that
variable, including one inside a media query, reaches every element using the
utility. Without `inline`, the value is frozen into the utility at build time
and breakpoint overrides never arrive.

The declaration that gives the variable its real value lives in an unlayered
`:root` / `html` rule (§5).

Do **not** put responsive values in `@theme`. It is compiled config, not a
cascade participant.

## 5. The responsive-token recipe

One pattern, used by both systems.

```css
/* 1 — register the names (compiled config) */
@theme inline {
  --container-plop: var(--container-plop);
}

/* 2 — declare the values, unlayered, so they win over @layer theme */
:root {
  --container-plop: 1440px;   /* base = narrowest viewport */

  /* …other plain declarations… */

  /* 3 — nested rules LAST, ascending width order */
  @variant xg  { --container-plop: 80%; }
  @variant lg  { --container-plop: 90%; }
  @variant 2xl { --container-plop: 1440px; }
}
```

Four rules that make it work, and each one is a real failure mode:

**`@variant` must be nested inside a style rule.** It is not a rule of its
own — it is a modifier that wraps the declarations of its *parent* rule. At
the top level of a file there is no selector to attach the declarations to,
and Tailwind drops them silently. This is the most common way to get a
responsive token that compiles cleanly and does nothing.

**Nested rules go after all plain declarations.** A plain declaration written
*after* a nested rule is a "mixed declaration"; browsers and bundlers have
handled those inconsistently, so keep the block shaped as
`declarations → nested rules`.

**Ascending width order.** `@variant` compiles to `min-width` media queries,
which all match at wide viewports. Equal specificity means source order
decides, so a wider step must be written after the narrower one it refines.

**Redeclare only what changes.** A step that omits a token keeps the value
from the step above. The list of overrides should read as a diff, not as a
full copy of the scale.

### Breakpoints

`@variant` names come from the `--breakpoint-*` tokens, so custom steps work
exactly like built-in ones:

```css
@theme {
  --breakpoint-xs: 375px;
  --breakpoint-xg: 992px;   /* the tablet-to-laptop gap */
  --breakpoint-2xl: 1440px; /* pulled in to match the shell's max width */
  --breakpoint-3xl: 1680px;
}
```

Add a step only when the layout genuinely changes at that width. Every extra
breakpoint is a column in every future tuning table.

## 6. Responsive typography

Lives entirely in `components/typography.css`. It is the only file that
decides how type responds to width.

Three layers, from coarsest to finest.

### 6.1 The root knob

```css
html {
  --text-html: 16px;
  font-size: var(--text-html);
}
```

Every `rem` on the page — type, spacing, radii, everything — resolves against
this. Changing it at one breakpoint rescales the whole page at that width,
proportionally, in one line:

```css
@variant xg { --text-html: 14px; }  /* laptops: pull the whole page in */
@variant lg { --text-html: 15px; }
```

This is the blunt instrument. Reach for it when a width feels globally too
big or too small, not to fix one heading.

Two cautions: the value must stay large enough to respect the user's browser
font-size preference at every step, and because it moves *everything*, test
the result rather than trusting the number.

### 6.2 The fluid display ramp

Headlines interpolate with the viewport instead of stepping, so they never
sit at an awkward size between breakpoints:

```css
--text-display: clamp(3.25rem, 7vw, 6.5rem);
--text-h1:      clamp(2.75rem, 4.5vw, 5.5rem);
--text-h2:      clamp(2.125rem, 4vw, 3.75rem);
--text-h3:      clamp(1.375rem, 2.2vw, 2rem);
--text-lead:    clamp(1.125rem, 1.2vw, 1.375rem);
```

Because the bounds are in `rem`, they also ride `--text-html`.

### 6.3 The fixed UI ramp

Labels, captions, metadata and card titles step rather than interpolate —
fluid UI text reads as unstable next to fluid headlines:

```css
--text-h4: 1.625rem;        --text-ui-xl: 1.25rem;
--text-h5: 1.375rem;        --text-ui-lg: 1.125rem;
--text-article: 1.0625rem;  --text-base: 1rem;
--text-ui: 0.9375rem;       --text-small: 0.875rem;
```

### 6.4 Consuming the scale

Every step is registered in `@theme inline` in `global.css`, so both of these
work and both read the live variable:

```html
<h2 class="text-h2">…</h2>
```

```css
.prose-plop h2 { font-size: clamp(var(--text-h4), 3vw, 2.25rem); }
```

Prefer the utility — the arbitrary-value form
(`text-[length:var(--text-h2)]`) resolves to the same thing and the Tailwind
language server will tell you to collapse it. Reach for `var(--text-*)` in
custom CSS only, as `prose.css` does above when a step needs to be composed
into a `clamp()`.

Never hardcode a `font-size` in a component: a size worth using twice is worth
being a step.

## 7. Responsive container

One token, one consumer.

```css
/* global.css */
:root {
  --container-plop: 1440px;
  @variant xg  { --container-plop: 80%; }
  @variant lg  { --container-plop: 90%; }
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

`.shell` is the only element allowed to own the page's horizontal bounds.
Sections are full-bleed and put a `.shell` inside; they never set their own
`max-width`. That way the site has exactly one width to re-tune.

Mixing `px` and `%` across steps is fine, but watch the seam: a `%` step
produces a *smaller* box than the full-bleed width just below it, so the
layout jumps inward at that breakpoint. Verify the transition at the
breakpoint itself, not 200px either side of it.

`--gutter` is the paired token, and it is fluid rather than stepped since it
has no seam to defend:

```css
--gutter: clamp(20px, 4vw, 64px);
```

## 8. Writing component CSS

Wrap component styles in `@layer components` so utilities keep winning over
them — that is what makes `class="btn mt-8"` behave as expected.

```css
@layer components {
  .btn { /* … */ }
}
```

Leave a file unlayered **only** when it is deliberately overriding a token
that Tailwind emitted — `typography.css` is the one case. Unlayered component
selectors beat utilities, which is almost never what you want.

Inside components, prefer a local custom property for anything a variant
re-points, instead of repeating the rule per variant:

```css
.btn:hover    { box-shadow: 2px 5px 0 0 var(--btn-lift-shadow); }
.btn--primary { --btn-lift-shadow: var(--color-plop-blue-900); }
.btn--outline { --btn-lift-shadow: var(--color-plop-blue); }
```

Reach for custom CSS when the effect needs pseudo-elements, complex
transitions or masks, or is materially clearer than a long utility string.
Everything else stays in utilities.

## 9. Anti-patterns

```css
/* ✗ @variant at the top level — no parent rule, silently dropped */
@variant lg { --container-plop: 90%; }

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
```

## 10. Verifying a token

The compiled CSS is the source of truth for whether the wiring worked:

```bash
npm run build
grep -o -E '.{0,60}--container-plop:[^;}]*' dist/_astro/*.css
```

Expected shape — a base value plus one `:root` block per step:

```css
:root{--container-plop:1440px}
@media (width>=992px){:root{--container-plop:80%}}
@media (width>=1024px){:root{--container-plop:90%}}
@media (width>=1440px){:root{--container-plop:1440px}}
```

If the media queries are missing, the `@variant` blocks were dropped — see
§5. If the utility carries a literal length instead of `var(…)`, the
`@theme inline` registration is missing — see §4.

Then check the seams in a browser at the breakpoints themselves: 375, 768,
992, 1024, 1440, 1920.

## 11. Porting this to a new project

1. `npm i tailwindcss @tailwindcss/vite`, add the Vite plugin.
2. Create `src/styles/global.css` with `@import "tailwindcss"`, and import it
   once from the base layout.
3. Declare the palette, fonts and `--breakpoint-*` steps in `@theme`.
4. Register every responsive token in `@theme inline`, self-referentially.
5. Create `components/typography.css`, unlayered, with `--text-html`, the
   fluid ramp, the fixed ramp and the `@variant` tuning table.
6. Put `--container-*` and `--gutter` in the unlayered `:root`, add `.shell`.
7. Build, grep the output (§10), and confirm the media queries are there
   before writing any page CSS.
