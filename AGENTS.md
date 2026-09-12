# AGENTS.md — PLOP! Sites

This file defines the working rules for AI coding agents contributing to this repository.

PLOP! Sites is a Brazilian-facing web development brand focused on fast, modern, easy-to-manage websites for small businesses and selected verticals such as real estate.

## 1. Read this first

Before changing UI, layout, styling, component structure, motion, or architecture:

1. Read `AGENTS.md`.
2. Read `DESIGN.md`.
3. Read `SPEC.md`.
4. Inspect the existing code before proposing a new pattern.
5. Reuse existing components, tokens, helpers, utilities, and naming conventions whenever possible.

### Precedence

When instructions conflict, use this order:

1. The user's latest explicit request.
2. `AGENTS.md`.
3. `DESIGN.md`.
4. `SPEC.md`.
5. Existing implementation conventions.

### Important override to the current SPEC

The previous scroll-driven laptop storytelling concept described in `SPEC.md` is deprecated.

Do **not** implement:

- a frame-by-frame laptop sequence;
- a canvas scrubbed with GSAP;
- a four-stage laptop storytelling animation;
- video-to-image sequence playback controlled by scroll.

The current direction is:

1. **Hero:** full-width/full-viewport video background featuring the floating laptop.
2. **Following section:** a video/project slider implemented with **Swiper**.
3. Remaining sections continue as a conventional, highly polished marketing website.

If `SPEC.md` still mentions the old storytelling sequence, this section of `AGENTS.md` supersedes it.

## 2. Core stack

Required stack:

- **Astro**
- **TypeScript**
- **Tailwind CSS**
- **Swiper**
- **Cloudflare Workers**
- HTML-first architecture
- Minimal client-side JavaScript

Do not replace these technologies without explicit approval.

Do not introduce React, Vue, Svelte, Solid, Alpine, HTMX, jQuery, or another client framework unless a specific feature genuinely requires it and approval is obtained first.

## 3. Astro conventions

Astro is the primary application framework.

Prefer:

- `.astro` components;
- server/build-time rendering;
- semantic HTML;
- Astro layouts;
- Astro content/data patterns;
- native browser APIs;
- scoped or global CSS only when Tailwind is not the appropriate tool.

Avoid hydrating components unnecessarily.

### Islands

Only ship client-side JavaScript for components that actually need runtime interaction.

Examples that may need JS:

- Swiper project slider;
- mobile navigation;
- lightweight interactive forms;
- video playback controls if required.

Everything else should remain static HTML whenever possible.

### Component philosophy

Create a component when at least one of these is true:

- it is reused;
- it has its own behavior;
- it has a clear semantic responsibility;
- extracting it makes a page materially easier to understand.

Do not turn every small HTML fragment into a component.

Preferred structure:

```text
src/
  components/
    layout/
    sections/
    ui/
  layouts/
  pages/
  styles/
  scripts/
  data/
  assets/
```

Suggested components:

```text
src/components/layout/Header.astro
src/components/layout/Footer.astro

src/components/sections/Hero.astro
src/components/sections/ProjectsSlider.astro
src/components/sections/About.astro
src/components/sections/HowItWorks.astro
src/components/sections/Benefits.astro
src/components/sections/Plans.astro
src/components/sections/FAQ.astro
src/components/sections/FinalCTA.astro

src/components/ui/Button.astro
src/components/ui/SectionHeading.astro
src/components/ui/ProjectSlide.astro
src/components/ui/PlanCard.astro
src/components/ui/Badge.astro
```

Do not create duplicate versions of an existing component just to achieve small styling changes. Prefer props and variants.

## 4. Tailwind CSS

Tailwind is the primary styling system.

For a new implementation, prefer **Tailwind CSS 4 through the official Vite plugin** used by current Astro versions.

Do not use the legacy `@astrojs/tailwind` integration for a new Tailwind 4 setup.

The global stylesheet should normally expose Tailwind with:

```css
@import "tailwindcss";
```

The exact installed configuration in the repository takes precedence over generic instructions.

### Tailwind usage rules

Prefer utility classes for:

- layout;
- spacing;
- typography;
- colors;
- borders;
- responsive behavior;
- simple hover/focus states.

Use custom CSS when:

- the effect is difficult to express cleanly with utilities;
- a complex pseudo-element is needed;
- video masks or advanced visual effects require it;
- animation logic is materially clearer in CSS;
- a reusable design token belongs globally.

Avoid excessively long arbitrary-value class strings when a reusable token is more appropriate.

Bad:

```html
<div class="rounded-[27px] px-[31px] mt-[73px] ...">
```

Better:

- reuse design-system values;
- use CSS variables/tokens;
- create a semantic component when justified.

## 5. Design system

`DESIGN.md` is the visual source of truth.

Do not invent new colors, typography, radii, shadows, icon styles, gradients, or spacing systems without first checking that file.

Core palette:

```text
PLOP Blue      #2563FF
PLOP Lime      #C7FF00
White          #FFFFFF
Ink            #0B0F1A
Black          #111111
Graphite       #1F1F1F
Graphite Soft  #2A2A2A

Secondary:
Violet         #8B6CF6
Pink           #FF4D84
```

Rules:

- blue is the dominant brand surface;
- lime is an accent and CTA color;
- white provides clarity and contrast;
- graphite/dark cards can provide structure;
- violet and pink are secondary accents only.

Do not turn the interface into a multicolor composition.

## 6. Typography

Follow `DESIGN.md`.

General direction:

- rounded;
- friendly;
- bold;
- modern;
- highly legible.

Display candidate:

- Fredoka

Alternative:

- Nunito

Body/UI:

- Nunito Sans or the approved project sans.

The **PLOP! logo is not text rendered with a font**.

Always use the approved vector/SVG logo asset.

Do not recreate the logo with CSS or approximate typography.

## 7. Hero

The hero is one of the most important parts of the site.

### Current concept

Use a **16:9 background video** featuring the floating laptop on the PLOP blue/liquid visual environment.

The video is decorative and should not contain the primary page content.

The following must remain real HTML:

- eyebrow;
- H1;
- body copy;
- buttons;
- trust/benefit text.

Suggested content direction:

```text
SITES PROFISSIONAIS PARA PEQUENOS NEGÓCIOS

Seu negócio
em destaque.

Sites modernos, rápidos e fáceis de gerenciar.
Design de alto desempenho com um preço que faz sentido.
```

Primary CTA:

```text
Quero meu site
```

Secondary CTA:

```text
Ver planos
```

### Hero layout

Desktop:

- text content primarily on the left;
- laptop/video composition primarily on the right or positioned so text remains readable;
- generous negative space;
- video may cover the complete hero background.

Do not place HTML text directly over visually noisy video areas without sufficient readability.

If necessary use:

- carefully controlled overlay;
- gradient;
- video positioning;
- content-safe area.

Do not use a heavy dark overlay that destroys the blue identity.

## 8. Hero video implementation

The hero video must prioritize performance.

Prefer:

```html
<video
  autoplay
  muted
  loop
  playsinline
  preload="metadata"
  poster="..."
>
```

Autoplay video must always be muted and `playsinline`.

Do not depend on JavaScript merely to start a standard background video.

### Video formats

Use web-appropriate sources according to browser support and production tests.

Typical deliverables may include:

- WebM;
- MP4 fallback;
- optimized poster image.

Do not ship unnecessarily high bitrate video.

The source master can be 1920×1080, but production encoding should be optimized through visual testing.

### Accessibility

The video is decorative unless explicitly stated otherwise.

Use appropriate semantics such as `aria-hidden="true"` or otherwise keep it out of the accessibility tree.

All important information must exist outside the video.

### Reduced motion

For `prefers-reduced-motion: reduce`, do not force continuous background motion.

Prefer:

- poster image;
- paused first frame;
- static visual alternative.

## 9. Projects / video slider

Immediately after the hero, introduce a visually strong slider showcasing websites/projects.

Use **Swiper**.

Do not build a custom slider from scratch unless Swiper cannot satisfy a documented requirement.

### Intent

The slider should feel:

- editorial;
- modern;
- tactile;
- large-scale;
- visual;
- smooth;
- premium but approachable.

The project videos represent real websites developed by PLOP/the developer.

### Recommended composition

Each slide can contain:

- project video;
- project/client name;
- sector/category;
- short description;
- optional project link;
- optional case-study CTA.

Video is the visual protagonist.

Avoid excessive card chrome.

### Swiper behavior

Use only the modules required by the final design.

Potential modules:

- Navigation
- Pagination
- Keyboard
- A11y
- Mousewheel only if intentionally designed

Do not enable every module by default.

Recommended baseline:

- touch/drag enabled;
- keyboard support;
- visible current/next slide cue;
- responsive `slidesPerView`;
- controlled `spaceBetween`;
- loop only if it genuinely improves the experience.

Do not use aggressive autoplay by default.

If autoplay is later enabled:

- allow user interaction;
- pause appropriately;
- respect reduced motion.

### Desktop visual direction

Consider:

- approximately one large active slide;
- part of the next slide visible;
- strong horizontal composition;
- large rounded media container;
- content aligned with PLOP spacing system.

The final values must come from actual visual testing, not arbitrary constants copied from examples.

### Mobile

The slider must remain touch-first.

Do not reproduce desktop spacing by simply scaling everything down.

Prefer:

- one dominant slide;
- natural swipe;
- legible metadata;
- sufficiently large controls.

## 10. Video inside project slides

Project videos should not all begin decoding simultaneously.

Rules:

- use `preload="metadata"` or `preload="none"` where appropriate;
- load poster images;
- play the active video only if the design requires autoplay;
- pause videos in inactive slides;
- mute autoplay video;
- use `playsinline`;
- avoid loading all high-resolution files eagerly.

If slide autoplay video is used, connect playback to Swiper events.

Conceptually:

```ts
swiper.on("slideChange", () => {
  pauseInactiveVideos();
  playActiveVideo();
});
```

Do not let multiple offscreen videos continue playing.

When visibility handling is appropriate, pause videos when the page/tab is no longer visible.

## 11. JavaScript policy

Default assumption:

**No client-side JavaScript unless needed.**

Add JS only for a specific interactive requirement.

Allowed/expected:

- Swiper;
- mobile navigation;
- form enhancements;
- small interaction helpers.

Avoid large generic helper libraries.

Do not add GSAP just because it was considered in an earlier concept.

The old GSAP storytelling animation is no longer part of the project.

GSAP may only be introduced later if a concrete motion requirement cannot be reasonably implemented with CSS/browser APIs and its value justifies the cost.

## 12. Motion

Motion should follow the PLOP visual language:

```text
floating
liquid
smooth
moderate
intentional
```

Avoid:

- exaggerated bounce;
- elastic motion;
- excessive parallax;
- scroll hijacking;
- animations on every element;
- long entrance delays;
- motion that delays conversion actions.

UI animation should remain subtle.

The hero video provides much of the visual movement. The surrounding UI should therefore be comparatively calm.

## 13. Content language

Public-facing copy is initially **Portuguese (Brazil)**.

Code, variable names, component names, comments, and technical documentation should normally be written in **English**.

Use concise, natural Brazilian Portuguese.

Avoid generic agency language such as:

```text
experiências digitais disruptivas
soluções 360º
transformação digital inovadora
```

Prefer:

```text
Sites modernos, rápidos e fáceis de gerenciar.
Sites que fazem acontecer.
Seu site pronto. E cuidado todos os meses.
Você cuida do seu negócio. A gente cuida do seu site.
```

## 14. Responsive design

Use a mobile-first implementation.

Primary breakpoints should follow Tailwind defaults unless the design genuinely requires a custom breakpoint.

Do not create many one-off breakpoints.

### Mobile priorities

1. message;
2. CTA;
3. project examples;
4. readability;
5. performance;
6. decoration.

Large decorative blobs and video effects may be simplified on smaller devices.

Do not download desktop-only heavy assets unless needed.

## 15. Accessibility

Target **WCAG 2.2 AA**.

Required:

- semantic headings;
- proper landmarks;
- keyboard navigation;
- visible focus states;
- sufficient color contrast;
- form labels;
- descriptive links;
- meaningful alt text;
- reduced-motion support;
- touch targets at least approximately 44×44 px;
- accessible Swiper controls;
- no essential information embedded only in video.

Use Swiper accessibility features where appropriate, but do not assume the library alone makes the carousel accessible.

Test keyboard interaction manually.

## 16. Performance

Performance is part of the PLOP product positioning.

A visually impressive site that performs poorly is a product failure.

Targets:

```text
LCP <= 2.5s
CLS <= 0.1
INP <= 200ms
```

Treat these as production goals, not guarantees.

Rules:

- minimize JS;
- lazy-load below-the-fold media;
- optimize all video;
- use responsive images;
- define intrinsic image dimensions;
- avoid layout shifts;
- use font subsets when practical;
- avoid loading unused font weights;
- do not preload non-critical assets;
- do not preload every slider video;
- preserve useful content before enhancements initialize.

Run performance tests after major media or interaction changes.

## 17. SEO

Pages must be server-rendered/pre-rendered HTML and crawlable without JavaScript.

Implement:

- unique title;
- meta description;
- canonical;
- Open Graph metadata;
- sitemap;
- robots.txt;
- semantic headings;
- structured data where appropriate;
- internal links;
- descriptive URLs;
- meaningful project/case content.

Do not hide SEO-critical content inside Swiper-generated-only markup if it prevents sensible parsing.

Slides should originate from semantic server-rendered HTML where practical and then be enhanced by Swiper.

## 18. Data and content

Do not hardcode repeated project content throughout components.

Prefer structured data or content collections.

Example:

```ts
type Project = {
  title: string;
  slug: string;
  category?: string;
  description?: string;
  poster: string;
  video?: {
    webm?: string;
    mp4?: string;
  };
  url?: string;
};
```

Keep data separate from presentation when content is expected to grow.

## 19. Cloudflare Workers deployment

Production target: **Cloudflare Workers**.

Do not configure Cloudflare Pages unless explicitly requested.

For this marketing site, prefer **static Astro output** unless server-side behavior is actually required.

### Static deployment

For a fully prerendered Astro site, deploy the generated `dist/` directory through **Cloudflare Workers Static Assets**.

A minimal `wrangler.jsonc` can follow this shape:

```jsonc
{
  "name": "plop-sites",
  "compatibility_date": "YYYY-MM-DD",
  "assets": {
    "directory": "./dist"
  }
}
```

Set `compatibility_date` to the date the Cloudflare configuration is created or deliberately updated.

Do not use deprecated **Workers Sites** for a new implementation.

### SSR / on-demand rendering

Do not add the Cloudflare Astro adapter merely because deployment uses Workers.

Only add `@astrojs/cloudflare` if the application actually requires Astro server/on-demand rendering.

If SSR becomes necessary, configure it deliberately and document why.

### Deployment commands

Prefer repository scripts such as:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "deploy": "npm run build && wrangler deploy"
  }
}
```

Adapt the package manager to the repository.

If the repository already uses `pnpm`, continue using `pnpm`.

Do not mix npm/yarn/pnpm lockfiles.

## 20. Environment variables

Never commit secrets.

Use:

- `.dev.vars` for local Worker secrets where appropriate;
- Cloudflare secrets/environment configuration for production;
- `.env` only according to Astro's public/private environment rules.

Only expose variables intentionally designed for the browser.

Never prefix a secret so that it becomes client-visible.

## 21. Forms and APIs

If a contact endpoint is needed, it may be implemented using a Cloudflare Worker/server endpoint rather than introducing a separate backend.

Keep server-side code small and explicit.

Requirements:

- validate server-side;
- sanitize/normalize input;
- rate limit or protect public forms where appropriate;
- use Turnstile if required;
- never expose service credentials;
- return useful HTTP status codes;
- do not track successful submission until the server confirms success.

## 22. Dependencies

Before installing a package:

1. verify the feature cannot be implemented cleanly with the existing stack;
2. check whether the project already has an equivalent dependency;
3. consider bundle impact;
4. install only maintained packages;
5. avoid dependencies for trivial utilities.

Never add a major dependency silently.

Swiper is already an approved dependency for the project slider.

## 23. TypeScript

Use TypeScript for project scripts and interactive client logic.

Avoid `any` unless unavoidable.

Prefer explicit domain types for:

- project data;
- navigation;
- plans;
- form payloads;
- reusable component props.

Keep types near the domain they describe unless shared broadly.

## 24. Code quality

Prefer:

- readable code;
- small functions;
- clear naming;
- early returns;
- predictable data flow;
- comments explaining **why**, not obvious syntax.

Avoid:

- premature abstraction;
- clever one-liners;
- massive utility files;
- duplicated markup;
- magic numbers;
- dead code;
- commented-out implementations.

Remove experiments once a direction is approved.

## 25. Formatting and linting

Respect the existing project configuration.

If the project includes:

- Prettier;
- ESLint;
- Astro check;
- Stylelint;

run the relevant commands before considering a task complete.

At minimum, after meaningful implementation changes:

```bash
astro check
astro build
```

or the repository's equivalent scripts.

Do not declare work complete when the production build is broken.

## 26. Testing

For major UI work, verify at minimum:

```text
Chrome
Edge
Firefox
Safari/WebKit when available
```

Test representative widths:

```text
375px
768px
1024px
1440px
1920px
```

Pay special attention to:

- hero crop;
- video safe area;
- Swiper overflow;
- slide controls;
- keyboard navigation;
- reduced motion;
- slow network behavior.

## 27. Media naming

Use predictable, lowercase, kebab-case filenames.

Examples:

```text
hero-laptop.webm
hero-laptop.mp4
hero-laptop-poster.webp

project-bercetche.webm
project-bercetche-poster.webp
project-silent-room.webm
```

Avoid names like:

```text
FINAL VIDEO 2 última REAL.mp4
image(12).png
```

Keep originals outside the production public bundle if they are not needed by the site.

## 28. Asset policy

Use the smallest appropriate production asset.

Images:

- AVIF/WebP where appropriate;
- SVG for logos/icons;
- avoid large PNGs unless transparency/rendering requires them.

Video:

- encode specifically for web;
- remove audio from decorative videos when audio is unnecessary;
- provide poster;
- avoid shipping raw editing masters.

## 29. Header and navigation

Keep the navigation simple.

Expected items may include:

```text
Início
Planos
Como funciona
Projetos
Blog
Sobre
```

Primary CTA:

```text
Quero meu site
```

Do not build a complex mega menu for the initial version.

## 30. Conversion

The website is a commercial site.

Every design decision should support at least one of:

- understanding the offer;
- building trust;
- showing quality;
- explaining the process;
- comparing plans;
- starting contact.

Do not add visual complexity that reduces CTA visibility or comprehension.

## 31. Definition of done

A feature is complete only when:

- it matches the requested functionality;
- it follows `DESIGN.md`;
- desktop and mobile are handled;
- keyboard behavior is reasonable;
- reduced motion is considered;
- media is optimized;
- no avoidable layout shift was introduced;
- no unnecessary JS was added;
- TypeScript/build checks pass;
- Cloudflare deployment compatibility is preserved.

## 32. Agent behavior

When working autonomously:

### Do

- inspect before editing;
- make the smallest coherent change;
- preserve existing conventions;
- explain important architectural decisions;
- validate the build;
- flag assumptions;
- keep performance in mind;
- update documentation when architecture changes.

### Do not

- redesign approved UI without being asked;
- rewrite unrelated files;
- migrate dependencies opportunistically;
- add frameworks unnecessarily;
- reintroduce the deprecated storytelling sequence;
- replace Swiper with a custom carousel;
- switch deployment from Workers;
- invent new brand colors;
- recreate the PLOP logo with text;
- commit secrets;
- claim tests passed if they were not run.

## 33. Current architecture summary

The current intended experience is:

```text
HEADER
  ↓
HERO
  background video:
  floating laptop + blue/liquid PLOP environment

  HTML overlay:
  headline + copy + CTAs
  ↓
PROJECTS / VIDEO SLIDER
  Swiper-based
  real website/project videos
  ↓
ABOUT
  ↓
HOW IT WORKS
  ↓
BENEFITS
  ↓
PLANS
  ↓
FAQ / SUPPORT
  ↓
FINAL CTA
  ↓
FOOTER
```

This architecture supersedes the previous laptop frame-sequence storytelling concept.

## 34. Final principle

PLOP's technical promise and its website must say the same thing:

> **Menos complexidade. Mais performance.**

Build the site with the same principle.
