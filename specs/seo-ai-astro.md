# Spec — SEO & AI layer for Astro projects

Portable specification for implementing, in any Astro project, the same
search-engine and AI-platform indexing structure that runs on PLOP! Sites.

Written to be executed end to end without knowing the source project.
Everything PLOP-specific is parameterised: where you see `<PLACEHOLDER>`,
substitute the target project's value.

- **Assumed stack:** Astro 5+ (content collections with the `glob` loader and
  `entry.body`), static output. Adaptations for SSR, i18n and blogless projects
  are in §6.
- **New dependencies:** none, beyond `@astrojs/sitemap`. The social card uses
  Playwright, usually already a devDependency; §5.10 gives the alternative if
  it is not.
- **Client cost:** zero. None of this adds JavaScript to the bundle.

---

## 1. What it delivers

When finished, the site publishes these artefacts and all of them regenerate
on their own:

| Artefact | Regenerates on | Source |
|---|---|---|
| `/robots.txt` | dev and build | endpoint, derived from `SITE_URL` |
| `/llms.txt` | dev and build | endpoint, from the mirror module |
| `/llms-full.txt` | dev and build | endpoint, from the mirror module |
| `/<route>.md` (one per page) | dev and build | endpoint, from the mirror module |
| `/sitemap-index.xml` | **build only** | `@astrojs/sitemap` |
| Default OG card | on demand (`npm run og`) | deterministic script |
| Per-article OG card | build | `astro:assets` |
| JSON-LD | build | builder module |

**Global acceptance criterion:** no sentence in the text layer is written
twice, and no fact (price, date, count) is retyped by hand if it already lives
in a module.

---

## 2. The governing principle: the duplication ladder

The hard decision in this spec is not technical, it is editorial: *where the
text of a page's markdown mirror comes from*. There are three rungs. **Always
use the highest one the page allows.**

| Rung | When it applies | Duplication |
|---|---|---|
| **1. Content** — the body comes from a collection (`entry.body`) | The page is prose: articles, legal pages, documentation | None. Full fidelity, no conversion step. |
| **2. Data** — the body is composed from modules (`PLANS`, `FAQ`…) | The page renders structured data: prices, FAQ, catalogue | None. An edited fact moves in both places at once. |
| **3. Authored prose** — a hand-written constant | The copy lives inside `.astro` components and cannot be read back out | Real. This is the system's only drift point. |

> **Rule of thumb:** before accepting rung 3 for a page, ask whether its prose
> can be promoted to rung 1 by moving it into a collection. In PLOP the privacy
> policy was markup inside the `.astro`; moving it to a `legal` collection and
> rendering it with `<Content />` removed the duplication and changed not one
> pixel. That migration is worth the hour it costs.

Rung 3 ends up unavoidable for a marketing home page, because its headline
lives as animated `<span>`s. Confine it to one block, name it `HOME_PROSE`, and
document that it is rewritten in the same commit as the hero.

---

## 3. Decisions to make first

Settle these before writing code; they change the shape of the implementation.

| Decision | Options | Recommendation |
|---|---|---|
| Mirror URL convention | `/route.md` · `/route/index.md` · `/route/md` | `/route.md`. The de facto convention, and it does not collide with `trailingSlash: "always"`. |
| `llms.txt` scope | index only · index + `llms-full.txt` | Both. The index is cheap and `llms-full.txt` falls out of the same module for free. |
| Which routes get a mirror | all · content routes only | All except routes that are slices of another (pagination) and `noindex` ones. |
| AI crawlers | allow · block · selective | A business decision. Name every agent explicitly in all three cases. |
| OG card | static JPEG · generated per page | Static JPEG plus a per-article derivation. Per-page generation with satori/resvg rarely pays for itself. |

---

## 4. File inventory

```text
src/
  data/
    site.ts              canonical constants: URL, name, description, OG
    page-markdown.ts     ← THE KEY MODULE: single source of the text layer
    schema.ts            JSON-LD builders
  pages/
    [...slug].md.ts      one endpoint for every mirror
    llms.txt.ts
    llms-full.txt.ts
    robots.txt.ts
  layouts/
    BaseLayout.astro     metadata contract
  content/
    <collections>
scripts/
  og-image.mjs           deterministic social card
astro.config.mjs         sitemap options
public/assets/og/        script output
```

---

## 5. Implementation

### 5.1 Site constants — `src/data/site.ts`

One place for everything else to derive from.

```ts
export const SITE_URL = "https://<DOMAIN>";
export const SITE_NAME = "<NAME>";

/**
 * One-line description. Used by llms.txt, the Organization graph and any
 * page without one of its own.
 *
 * If it contains a figure that lives in a data module, interpolate it.
 */
export const SITE_DESCRIPTION = `<DESCRIPTION>`;

/** Default social card. One place where this path lives. */
export const OG_IMAGE = "/assets/og/<name>-og.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT = "<ALT>";
```

> **Why interpolation matters.** In PLOP, `SITE_DESCRIPTION` quoted an entry
> price the plan cards had moved past months earlier. Deriving it from
> `entryPrice()` made the drift impossible. Look for this pattern in the target
> project before trusting its existing descriptions.

### 5.2 Content collections

Any prose that can be a collection should be one (§2, rung 1). The `schema`
must require `description` — that is what turns a missing meta description into
a build error instead of a silent gap.

```ts
const legal = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/legal" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),   // required, on purpose
    updatedAt: z.coerce.date(),
  }),
});
```

And the page renders it rather than containing the text:

```astro
---
const entry = await getEntry("legal", "<slug>");
if (!entry) throw new Error("Missing legal entry: <slug>");
const { Content } = await render(entry);
---
<div class="<prose-class>"><Content /></div>
```

### 5.3 The mirror module — `src/data/page-markdown.ts`

The heart of the system. It defines one type, one function that enumerates
every text surface, and one that renders a single surface.

```ts
export type TextPage = {
  /** Canonical HTML route, with whatever trailing slash the site uses. */
  path: string;
  /** Its markdown sibling. */
  mdPath: string;
  title: string;
  description: string;
  /** `Key: value` lines rendered under the description. */
  meta: string[];
  /** Body markdown, starting at heading level two. */
  body: string;
  /** Groups the sections of llms.txt. */
  section: "site" | "blog";
  /** Last meaningful change, when the source knows one. */
  updatedAt?: Date;
};

/** `/` → `/index.md`, `/blog/x/` → `/blog/x.md`. The rule's only definition. */
export const mdPathFor = (path: string): string =>
  path === "/" ? "/index.md" : `${path.replace(/\/+$/, "")}.md`;

export const textPages = async (): Promise<TextPage[]> => { /* … */ };

export const renderTextPage = (page: TextPage): string =>
  [
    `# ${page.title}`, "",
    `> ${page.description}`, "",
    `URL: ${abs(page.path)}`,
    ...page.meta, "",
    "---", "",
    page.body, "",
    "---", "",
    `${SITE_NAME} — ${abs("/")}`,
  ].join("\n");
```

Three details that are not optional:

1. **The canonical URL goes inside the body.** A model quoting the mirror must
   link the reader to the HTML page, not to the `.md`.
2. **Collection bodies are served verbatim** (`entry.body.trim()`). With no
   conversion step, no heading or list can be lost.
3. **`mdPathFor` is defined once** and imported by both the endpoint and the
   layout. Two definitions of that rule is a broken link waiting to happen.

### 5.4 The sibling URLs — `src/pages/[...slug].md.ts`

A single endpoint with a rest parameter covers every route, nested ones
included. A page added to `textPages()` gets its mirror without a second edit.

```ts
import type { APIRoute, GetStaticPaths } from "astro";
import { renderTextPage, textPages, type TextPage } from "../data/page-markdown.ts";

export const getStaticPaths: GetStaticPaths = async () =>
  (await textPages()).map((page) => ({
    // `/blog/x.md` → slug `blog/x`. The route contributes the extension.
    params: { slug: page.mdPath.replace(/^\//, "").replace(/\.md$/, "") },
    props: { page },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(renderTextPage(props.page as TextPage), {
    headers: { "content-type": "text/markdown; charset=utf-8" },
  });
```

**Discovery.** In the layout, next to the canonical:

```astro
<link rel="alternate" type="text/markdown" href={markdownHref} />
```

### 5.5 `llms.txt` and `llms-full.txt`

Endpoints, never files in `public/`. That is the whole difference between "it
regenerates itself in dev and in build" and "somebody has to remember".

`llms.txt` follows the agreed format: H1, blockquote summary, a paragraph of
context, sections of annotated links. **The links point at the `.md` files**,
not at the HTML.

```text
# <NAME>

> <SITE_DESCRIPTION>

<one paragraph of context: what it is, who for, what language>

## Pages
- [Title](https://…/route.md): description

## Blog
- [Title](https://…/blog/x.md): description

## Optional
- [llms-full.txt](https://…/llms-full.txt): the full text in one file.
```

`llms-full.txt` is `renderTextPage()` applied across every page and
concatenated. **Date it by the newest content, not by `new Date()`**: a build
that changed nothing must produce a byte-identical file, or every deploy
generates noise.

### 5.6 `robots.txt`

An endpoint, so the `Sitemap:` line derives from `SITE_URL`.

**If the project has a `public/robots.txt`, delete it**: it collides with the
route, and the static file wins silently.

```ts
const AI_AGENTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot",
  "PerplexityBot", "Perplexity-User",
  "Google-Extended", "Applebot-Extended",
  "meta-externalagent", "Amazonbot", "Bytespider", "CCBot",
];
```

Name each agent explicitly even when allowing all of them. A bare
`User-agent: *` only means *not forbidden*; a named `Allow` is a recorded
decision. To block one, give it its own `Disallow: /` rather than deleting it
from the array — silence and refusal are different signals.

Also add `Disallow:` for whatever API routes the site exposes.

### 5.7 Sitemap — `astro.config.mjs`

```js
sitemap({
  filter: (page) => /* exclude slices: pagination, etc. */,
  serialize: (item) => ({
    ...item,
    ...(lastmod ? { lastmod } : {}),
    changefreq: ChangeFreqEnum.WEEKLY,   // the enum, not the string
    priority: priorityFor(pathname),
  }),
})
```

`lastmod` has to be read from the frontmatter **with a regex over the files**,
not with `getCollection()`: the config runs before the content layer exists.

Endpoints (`.md`, `.txt`) are excluded from the sitemap automatically, because
the integration only walks page routes. That is correct: listing both
`/blog/x/` and `/blog/x.md` would be asking for the same text to be indexed
twice.

### 5.8 JSON-LD — `src/data/schema.ts`

Builders fed by the same modules that render the pages. No JSON-LD written
inside a template.

Nodes linked by `@id`, never repeated: one `ORGANIZATION_ID` and one
`WEBSITE_ID` for the whole site, referenced from every page's graph. That is
what makes a crawler read the site as a single publisher.

Minimum set of builders: `organizationSchema()`, `websiteSchema()`,
`pageSchema()`, `breadcrumbSchema()`. Add the domain-specific ones
(`faqSchema`, `productSchema`, `plansSchema`…) according to what the site
renders.

### 5.9 Metadata contract — the layout

`title` and `description` are **required props**, with no default. That is the
one cheap guarantee that no page ships without them.

```ts
interface Props {
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  ogType?: "website" | "article";
  article?: { publishedTime: string; modifiedTime: string; section?: string };
  schema?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
  markdown?: boolean;   // false where there is no mirror
}
```

The canonical is always derived from `Astro.url.pathname`. **Do not add a prop
for it**: a prop is an opportunity for two pages to declare the same canonical.

A length guard, free and dev-only:

```ts
if (import.meta.env.DEV && (description.length < 110 || description.length > 165)) {
  console.warn(`[seo] ${Astro.url.pathname}: description is ${description.length} chars.`);
}
```

Tags that must be emitted and are almost always missing: `og:image:width`,
`og:image:height`, `og:image:alt`, and on articles `og:type="article"` with
`article:published_time` and `article:modified_time`.

### 5.10 The social card

**JPEG 1200×630, not WebP.** WhatsApp will not preview a WebP card, and it is
the channel where most links get shared in many projects.

Generate it with a deterministic script that renders an SVG through Playwright
and captures it as JPEG. Deterministic means rerunning it produces the same
file, which is why it is an on-demand script (`npm run og`) rather than a build
step.

```js
await tab.screenshot({ path: out, type: "jpeg", quality: 88 });
```

If the project has no Playwright, use `sharp` (shipped with Astro) over an SVG,
or commission the asset from design. **Never recreate a logo with CSS type**:
embed the approved vector SVG.

For article covers, re-derive to JPEG 1200×630 with `astro:assets` rather than
reusing the image the page displays:

```ts
const ogCard = await getImage({
  src: cover, width: 1200, height: 630, format: "jpg", fit: "cover",
});
```

---

## 6. Adaptations

**SSR / on-demand.** The endpoints work the same, but `getStaticPaths`
disappears from the mirror endpoint: resolve the page from the parameter at
request time and return 404 if it does not exist. Under SSR the `Response`
headers **do** reach the browser, so set `cache-control` deliberately.

**i18n.** `textPages()` returns one entry per language and `mdPathFor` prefixes
the locale. `llms.txt` gains a section per language, or one file per locale is
published. Add `hreflang` in the layout and the `i18n` option to the sitemap.

**No blog.** Drop the `blog` member of `TextPage["section"]` and the
corresponding entries. Nothing else changes.

**No content collections.** Every page falls to rung 2 or 3 of the ladder (§2).
That works, but document explicitly which blocks are authored prose requiring
manual upkeep.

**Cloudflare Pages / Vercel / Netlify.** No change: under static output the
endpoints are written as real files and the host serves them by extension.
Verify that `.md` is served as `text/markdown` and not forced as a download.

---

## 7. Known traps

The ones that cost an afternoon if nobody warned you:

1. **`public/robots.txt` wins over `src/pages/robots.txt.ts`**, silently.
   Delete the static file.
2. **Static output discards the `Response` headers.** The file is written to
   `dist/` and the host decides the content type by extension. The headers only
   apply in `dev`.
3. **`trailingSlash: "always"` does not affect routes with an extension.**
   `/llms.txt` and `/blog/x.md` work without a trailing slash.
4. **The sitemap is not emitted in `astro dev`.** Inherent to the integration.
   Do not reimplement it as an endpoint just for dev parity; document the
   limit.
5. **With `// @ts-check` in the config, `changefreq: "weekly"` does not
   typecheck.** Use `ChangeFreqEnum.WEEKLY`, which `@astrojs/sitemap`
   re-exports.
6. **`getCollection()` is not available in `astro.config.mjs`.** Read the
   frontmatter with `readFile` + regex for `lastmod`.
7. **Paginated listing pages** must have no mirror and must not share a
   description with page one. Give each its own (`Page N of M…`).
8. **A `String.replace` that does not find its anchor returns the original
   silently.** If you automate edits, assert that the substitution happened.
9. **A Playwright `fullPage` screenshot distorts layouts with viewport-relative
   heights** (`svh`, sticky). To check for visual regressions, capture at real
   viewport height.

---

## 8. Verification

```bash
npm run check     # 0 errors
npm run build     # must complete
```

Then, against the build:

- [ ] `dist/` contains `robots.txt`, `llms.txt`, `llms-full.txt` and one `.md`
      per entry of `textPages()`.
- [ ] In `dev`, every endpoint answers 200 with the right content type.
- [ ] An article's source body appears **verbatim** inside its `.md`.
- [ ] Every page has a `description`, and its length falls within 110–165.
- [ ] No HTML contains dead routes (deleted routes in links or JSON-LD).
- [ ] Every JSON-LD block parses, and the organization and website `@id`s are
      unique.
- [ ] `og:image` **actually loads** (the classic failure is a path to a file
      that does not exist), is JPEG 1200×630, and articles report
      `og:type=article` with `article:published_time`.
- [ ] The sitemap carries `lastmod` on dated content and lists no deleted
      routes and no `.md`.
- [ ] The client JS bundle has not changed size. None of this should add
      JavaScript.

An audit script walking `dist/**/*.html` and checking points 4, 5 and 6
automatically costs twenty lines and catches regressions the eye does not.

---

## 9. Suggested order of execution

1. Site constants and correction of drifted facts (§5.1).
2. Migrate to collections whatever prose can be promoted to rung 1 (§5.2).
3. `page-markdown.ts` — enumerate and render (§5.3).
4. Mirror endpoint and the `rel=alternate` link (§5.4).
5. `llms.txt` and `llms-full.txt` (§5.5).
6. `robots.txt` (§5.6).
7. Sitemap options (§5.7).
8. JSON-LD review (§5.8).
9. Layout contract and Open Graph (§5.9).
10. Social card (§5.10).
11. Description audit and dead-route cleanup.
12. Full verification (§8).

Steps 1 and 2 always come first: everything else derives from them, and doing
them last forces a rewrite of what was already built.
