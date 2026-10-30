# LINKTREE.spec.md — portable link-in-bio page spec

A self-contained description of the `/linktree/` page: a brand-owned
replacement for Linktree that holds a handful of destinations (chat, social,
site) and nothing else. Written so it can be dropped into a **new** Astro +
Tailwind CSS 4 project without reading anything else in this repository.

The reference implementation is `src/pages/linktree.astro`. The only
project-specific parts are the token names (`plop-*`), the copy and the
links. Rename the tokens, swap the data and the page is unchanged.

Companion documents: `TYPE-CONTAINER.spec.md` (the `.shell` container and the
`--text-*` scale this page consumes) and `ANIMATIONS.spec.md` (the `.anim`
reveal on the cards). Both are optional. §7 lists the fallbacks.

---

## 1. The idea in one paragraph

A link-in-bio page is opened from an Instagram/TikTok bio, inside an in-app
browser, on a phone, by someone who has already decided to tap. The page's
only job is to **route that tap**. So it has no header, footer, floating
widgets or long copy. It is one full-height brand-colored screen with the
logo, a one-line headline, one question and **three to four large link
cards**. One card, the primary action, takes the accent color. The others are
tonal steps of the same palette. The page is `noindex` and stays out of the
sitemap, because three links are not content.

---

## 2. Anatomy

```text
┌──────────────────────────── 100svh, brand ground ───────────────────────────┐
│ [logo → /]                                                                  │
│                                                                             │
│ Headline (h1, ≤12ch, balanced)                                              │
│ One question (lead, muted)                                                  │
│                                                                             │
│ ┌─ accent card ─────┐ ┌─ light card ──────┐ ┌─ dark card ───────┐           │
│ │ (icon)          → │ │ (icon)          → │ │ (icon)          → │  ≥ md:    │
│ │                   │ │                   │ │                   │  3 cols,  │
│ │ Title             │ │ Title             │ │ Title             │  tall     │
│ │ detail            │ │ detail            │ │ detail            │           │
│ └───────────────────┘ └───────────────────┘ └───────────────────┘           │
│                                                                             │
│ one-line footer (muted, small)                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Mobile (< md): cards stack as full-width rows → [icon] Title/detail [→]
```

- **Vertical rhythm:** the inner column is `flex-col` at full height. The
  logo sits at the top, the footer line at the bottom, and the headline +
  cards block takes `my-auto`, so it centers in whatever height remains.
- **Desktop card:** column layout, `justify-between`, so the icon sits top
  left, the arrow top right (absolute) and the title + detail bottom left.
  Height `clamp(15rem, 30vh, 20rem)`.
- **Mobile card:** row layout, `min-h-[5.5rem]` (88px, roughly two touch
  targets tall), icon chip left, text in the middle (`truncate`), arrow right.

---

## 3. Design rules

1. **One accent card.** Only the primary action (usually WhatsApp/chat) uses
   the accent color. If two cards wear it, neither reads as the action.
2. **Surfaces are tonal steps, not new colors.** The other cards are white
   and the darkest step of the brand ramp. The darkest step has to be
   visibly darker than the page ground. A step one notch off the ground
   (e.g. `blue-900` on `blue-700`) disappears; use the `950` end.
3. **No shadows.** Depth comes from tone and radius. Hover lifts the card
   4px (`-translate-y-1`), shifts its background one tone, and moves the arrow
   4px right. No scale, no bounce.
4. **Secondary text is tinted, never gray:** ink at 75% on the accent, the
   brand's "on-white" tone on white, white at 75% on dark.
5. **Icon chip:** a circle of `bg-current/10`. It inherits the card's text
   color, so one class works on all three surfaces.
6. **Icons are drawn in the project's own icon family** (stroke icons on a
   24px grid). Do not paste official solid brand logos: three vendor colors
   pull harder than the accent card.
7. **Ground:** the brand color at full bleed, plus at most two large,
   still radial masses for depth. No animated liquid/blur filters: the in-app
   browser has to paint instantly.
8. **Radius:** the system's card radius (28px here). The reference adds
   `[corner-shape:squircle]`, which browsers without support ignore.

---

## 4. Required tokens

The page needs these roles. The names are the reference project's; map them
to yours.

| Role | Reference token | Used for |
|---|---|---|
| Page ground | `bg-plop-blue-deep` | section background (body text passes 4.5:1 on it) |
| Mass tones | `--color-plop-blue`, `--color-plop-blue-800` | the two radial masses |
| Accent | `bg-plop-lime` / `hover:bg-plop-lime-bright` | primary card |
| Ink | `text-plop-ink` | text on accent and on white |
| Light hover | `hover:bg-plop-blue-50` | white card hover |
| Dark surface | `bg-plop-blue-950` / `hover:bg-plop-blue-900` | dark card |
| On-white muted | `text-plop-on-white` | detail on the white card |
| Card radius | `rounded-plop-lg` (28px) | cards |
| Small radius | `rounded-plop-sm` (12px) | logo link focus shape |
| Motion | `--duration-fast` (250ms), `--ease-plop-out` (`cubic-bezier(0.22,1,0.36,1)`) | hover transitions |
| Type | `--text-h1`, `--text-h3`, `--text-lead`, `text-ui`, `text-small` | headline, card title, question, detail, footer |
| Display face | `font-display` | card titles |

Global helpers the page assumes:

```css
.on-blue { color: #fff; }           /* text on the brand ground */
.muted   { color: rgb(255 255 255 / .75); }
:focus-visible { outline: 3px solid var(--color-accent); outline-offset: 3px; }
```

---

## 5. Data model

Links are data, not markup. Each card declares its own surface classes, so
the template has no per-card branches.

```ts
type LinkCard = {
  title: string;        // "WhatsApp"
  detail: string;       // phone, @handle or one short phrase
  href: string;
  icon: IconName;       // from the project's icon component
  surface: string;      // bg + text + hover bg classes
  detailTone: string;   // tinted secondary text class
  attrs?: Record<string, string | undefined>; // tracking, progressive upgrades
};
```

Reference data:

```ts
const links: LinkCard[] = [
  {
    title: "WhatsApp",
    detail: HAS_WHATSAPP ? PHONE_DISPLAY : "Fale com a gente",
    href: whatsappHref(),                         // https://wa.me/<digits>?text=…
    icon: "whatsapp",
    surface: "bg-plop-lime text-plop-ink hover:bg-plop-lime-bright",
    detailTone: "text-plop-ink/75",
    attrs: {
      "data-whatsapp-web": HAS_WHATSAPP ? whatsappWebHref() : undefined,
      "data-track": HAS_WHATSAPP ? "whatsapp_click" : "cta_primary_click",
    },
  },
  {
    title: "Instagram",
    detail: "@plopsites",
    href: "https://www.instagram.com/plopsites/",
    icon: "instagram",
    surface: "bg-white text-plop-ink hover:bg-plop-blue-50",
    detailTone: "text-plop-on-white",
  },
  {
    title: "Site",
    detail: "Planos, projetos e blog",
    href: "/",
    icon: "desktop",
    surface: "bg-plop-blue-950 text-white hover:bg-plop-blue-900",
    detailTone: "text-white/75",
  },
];
```

**Never invent a destination.** If a handle or number is unknown, ask. A link
to a profile that does not exist is a dead CTA that looks live. The phone and
the WhatsApp number come from one constant (digits only for `wa.me`).

**WhatsApp on desktop:** the `wa.me` link works without JS and hands off to
the app on phones. On desktop it costs a click on WhatsApp's interstitial,
so a small script swaps `href` for `data-whatsapp-web`
(`https://web.whatsapp.com/send?phone=…&text=…`) when the device is not
mobile:

```ts
const isMobile = () =>
  (navigator as any).userAgentData?.mobile ??
  (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    matchMedia("(pointer: coarse) and (hover: none)").matches);

if (!isMobile()) {
  document.querySelectorAll<HTMLAnchorElement>("a[data-whatsapp-web]")
    .forEach((a) => { if (a.dataset.whatsappWeb) a.href = a.dataset.whatsappWeb; });
}
```

---

## 6. Page template

```astro
---
// src/pages/linktree.astro
import BaseLayout from "../layouts/BaseLayout.astro";
import Logo from "../components/ui/Logo.astro";
import Icon from "../components/ui/Icon.astro";
// …links data from §5
---

<BaseLayout title="Links" description="…110–165 chars…" noindex markdown={false} bare>
  <section
    class="on-blue relative isolate flex min-h-svh flex-col overflow-hidden bg-plop-blue-deep"
    aria-labelledby="links-titulo"
  >
    <div
      class="pointer-events-none absolute -right-[18%] -top-[30%] -z-10 size-[min(110vw,760px)] rounded-full bg-[radial-gradient(circle_at_44%_58%,color-mix(in_srgb,var(--color-plop-blue)_85%,transparent),transparent_70%)]"
      aria-hidden="true"
    ></div>
    <div
      class="pointer-events-none absolute -bottom-[36%] -left-[24%] -z-10 size-[min(120vw,820px)] rounded-full bg-[radial-gradient(circle_at_50%_50%,color-mix(in_srgb,var(--color-plop-blue-800)_90%,transparent),transparent_70%)]"
      aria-hidden="true"
    ></div>

    <div class="shell flex flex-1 flex-col py-[clamp(32px,6vh,72px)]">
      <a href="/" class="w-fit rounded-plop-sm" aria-label="Plop! Sites — início">
        <Logo height={56} class="h-11 w-auto md:h-14" decorative />
      </a>

      <div class="my-auto pt-[clamp(48px,10vh,120px)] pb-[clamp(32px,6vh,64px)]">
        <h1 id="links-titulo" class="max-w-[12ch] text-[length:var(--text-h1)] text-balance">
          Sites que fazem acontecer.
        </h1>
        <p class="muted mt-5 text-[length:var(--text-lead)]">Por onde você quer seguir?</p>

        <ul class="mt-10 grid gap-3 md:mt-14 md:grid-cols-3 md:gap-5" role="list">
          {links.map((link, index) => (
            <li class="anim" data-anim="bottom" data-once data-delay={index * 150}>
              <a
                href={link.href}
                class:list={[
                  "group relative flex min-h-[5.5rem] items-center gap-4 rounded-plop-lg [corner-shape:squircle] p-4 pr-5 no-underline transition-[background-color,translate] duration-[var(--duration-fast)] ease-[var(--ease-plop-out)] hover:-translate-y-1",
                  "md:min-h-[clamp(15rem,30vh,20rem)] md:flex-col md:items-start md:justify-between md:p-7",
                  link.surface,
                ]}
                {...link.attrs}
              >
                <span class="grid size-14 shrink-0 place-items-center rounded-full bg-current/10 md:size-16">
                  <Icon name={link.icon} size={28} />
                </span>
                <span class="min-w-0 flex-1 md:flex-none">
                  <span class="block font-display text-[length:var(--text-h3)] font-bold leading-[0.98] tracking-[-0.035em]">
                    {link.title}
                  </span>
                  <span
                    class:list={["mt-1.5 block truncate text-ui font-semibold md:mt-2.5", link.detailTone]}
                    data-numeric={link.icon === "whatsapp" ? "" : undefined}
                  >
                    {link.detail}
                  </span>
                </span>
                <Icon
                  name="arrow-right"
                  size={24}
                  class="shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-plop-out)] group-hover:translate-x-1 md:absolute md:right-7 md:top-7 md:size-7"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      <p class="muted text-small">Desenvolvimento web de Curitiba para todo o Brasil.</p>
    </div>
  </section>
</BaseLayout>
```

Notes:

- `min-h-svh`, not `100vh`: on mobile, `vh` includes the area behind the
  in-app browser's toolbar and pushes the footer line off screen.
- `role="list"` keeps list semantics in Safari, which drops them when
  `list-style` is removed.
- The whole card is the `<a>`, so the full card is the tap target. Title and
  detail are `<span>`s, not headings: they are link text, and the accessible
  name reads "WhatsApp +55 (41) …".
- The arrow and the icon chip are `aria-hidden` (the Icon component sets it).
- `data-numeric` on the phone gives tabular figures.

---

## 7. Layout support

### 7.1 `bare` layout prop

The page reuses the site's base layout (head, metadata, fonts, CSP, scripts)
but drops the chrome:

```astro
---
// BaseLayout.astro — Props
/** No header, footer or WhatsApp dock: a page that is only its own links. */
bare?: boolean;
---
{!bare && <Header />}
<main id="conteudo" tabindex="-1"><slot /></main>
{!bare && <Footer />}
{!bare && <WhatsAppDock />}
```

Keep the skip link and the analytics/WhatsApp scripts. They still apply.

### 7.2 Without the companion specs

- **No `.shell`:** use `mx-auto w-full max-w-6xl px-5 md:px-10`.
- **No `--text-*` scale:** h1 `clamp(2.75rem, 6vw, 5.5rem)` / 700 /
  line-height 0.98 / tracking -0.035em; card title `clamp(1.375rem, 2.2vw, 2rem)`;
  lead `clamp(1.125rem, 1.5vw, 1.375rem)`; detail `0.9375rem` semibold;
  footer `0.875rem`.
- **No `.anim` reveal:** drop the `anim`/`data-*` attributes from the `<li>`.
  The cards are visible by default. Never put a reveal on the `h1`: it is the
  LCP element.

---

## 8. SEO and indexing

- `noindex` (`<meta name="robots" content="noindex, nofollow">`), and no
  markdown mirror or `llms.txt` entry.
- Excluded from the sitemap:

  ```js
  // astro.config.mjs → sitemap({ filter })
  filter: (page) => new URL(page).pathname !== "/linktree/",
  ```

- Still give it a real `title` and a 110–165 character `description`: the
  bio link gets shared, and the Open Graph card is what people see.

---

## 9. Trailing slash in dev

With `trailingSlash: "always"`, Astro's dev server answers `/linktree` with a
404, while Cloudflare Workers Static Assets (`html_handling` defaults to
`auto-trailing-slash`) redirects it in production. To make dev behave like
production, add this Vite plugin:

```js
// astro.config.mjs
/** @type {import("vite").Plugin} */
const devTrailingSlash = {
  name: "plop:dev-trailing-slash",
  apply: "serve",
  configureServer(server) {
    /** @type {import("vite").Connect.NextHandleFunction} */
    const redirect = (req, res, next) => {
      const [pathname, query] = (req.url ?? "").split("?");
      const isPageRequest =
        req.method === "GET" && req.headers.accept?.includes("text/html");
      if (!isPageRequest || pathname.endsWith("/") || pathname.includes(".")) {
        return next();
      }
      res.statusCode = 301;
      res.setHeader("Location", `${pathname}/${query ? `?${query}` : ""}`);
      res.end();
    };
    // Astro unshifts its trailing-slash 404 in a post hook; this plugin is
    // registered after Astro's, so its unshift lands in front.
    return () => {
      server.middlewares.stack.unshift({ route: "", handle: redirect });
    };
  },
};

export default defineConfig({
  trailingSlash: "always",
  vite: { plugins: [tailwindcss(), devTrailingSlash] },
});
```

Do **not** add `enforce: "pre"` or use plain `server.middlewares.use()`:
either way Astro's middleware runs first and the redirect never fires. The
plugin relies on Astro's internal registration order (verified on Astro 5).
Retest after a major Astro upgrade.

In the bio itself, always publish the URL **with** the slash
(`https://example.com/linktree/`) to skip the redirect.

---

## 10. Gotchas

- **New page, unstyled in dev:** Tailwind 4's Vite plugin can miss classes
  from a file created while `astro dev` is running. The page then collapses
  (no `min-h-svh`, no radii). Restart the dev server. The production build
  is unaffected.
- **Focus on the accent card:** the global accent focus ring sits on an
  accent-colored card. It stays visible because of the 3px offset against the
  page ground. Do not drop the offset.
- **In-app browsers** open `target="_blank"` links unpredictably. Leave
  targets default and let the OS hand off `wa.me` and `instagram.com` to
  their apps.

---

## 11. Porting checklist

1. Map the tokens in §4 to the new project's palette. Choose the single
   accent card.
2. Add the project's icons for each destination (stroke family, 24px grid).
3. Fill the §5 data with **confirmed** URLs, handles and numbers.
4. Add the `bare` prop to the base layout (§7.1).
5. Create `src/pages/linktree.astro` from §6. Adjust the headline, question
   and footer line to the brand voice.
6. Set `noindex`, exclude from the sitemap and markdown mirrors (§8).
7. If `trailingSlash: "always"`, add the dev plugin (§9).
8. Run `astro check` and `astro build`. Screenshot at 390px and 1440px:
   - the section fills the viewport;
   - no horizontal scroll;
   - the dark card is distinct from the ground;
   - the accent card is the only accent element on screen.
9. Tab through: skip link, logo, cards in order, each with a visible ring.
