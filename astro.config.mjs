// @ts-check
import { readFileSync } from "node:fs";

import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import { SITE_URL } from "./src/data/site.ts";

/**
 * Reads one key out of `.dev.vars`. That file belongs to the Worker runtime and
 * Astro never looks at it on its own, but the Turnstile sitekey has to be baked
 * into static markup at build time — so the build comes to fetch it, keeping
 * the sitekey and its secret in a single place to rotate.
 *
 * @param {string} name
 * @returns {string | undefined}
 */
const readDevVar = (name) => {
  let source;
  try {
    source = readFileSync("./.dev.vars", "utf8");
  } catch {
    return undefined;
  }

  /* Commented lines start with `#`, so anchoring at the key name skips them. */
  const match = source.match(new RegExp(`^${name}=(.*)$`, "m"));
  return match?.[1].trim().replace(/^["']|["']$/g, "") || undefined;
};

/**
 * The sitekey is public — it ships inside the HTML of every page — so baking it
 * into the bundle leaks nothing. The environment wins over the file so a build
 * host without `.dev.vars` can still supply it.
 */
const TURNSTILE_SITE_KEY =
  process.env.TURNSTILE_SITE_KEY ?? readDevVar("TURNSTILE_SITE_KEY");

/* A silent miss would ship a contact form nobody can submit, and the failure
   would only surface in production. Better to never produce that build. */
if (!TURNSTILE_SITE_KEY) {
  throw new Error(
    "TURNSTILE_SITE_KEY is missing. The contact form renders its widget from " +
      "this key, so a build without it would ship a form that cannot be sent. " +
      "Set it in .dev.vars or in the environment before building.",
  );
}

/**
 * Last meaningful change per route, read from the content collections at
 * config time. A sitemap without `lastmod` asks a crawler to guess; these are
 * the only routes on the site whose content actually has a date.
 */
const postDates = await (async () => {
  const { readdir, readFile } = await import("node:fs/promises");
  const dates = new Map();

  for (const [dir, prefix] of [
    ["./src/content/blog", "/blog/"],
    ["./src/content/legal", "/"],
  ]) {
    for (const file of await readdir(dir)) {
      if (!file.endsWith(".md")) continue;
      const source = await readFile(`${dir}/${file}`, "utf8");
      /* Frontmatter is read directly rather than through astro:content: this
         runs before the content layer exists. */
      const updated = source.match(/^updatedAt:\s*(\S+)/m)?.[1];
      const published = source.match(/^publishedAt:\s*(\S+)/m)?.[1];
      const date = updated ?? published;
      if (date) dates.set(`${prefix}${file.replace(/\.md$/, "")}/`, date);
    }
  }

  return dates;
})();

/**
 * Priority by route shape. The home carries the offer; the policy does not.
 * @param {string} pathname
 */
const priorityFor = (pathname) => {
  if (pathname === "/") return 1.0;
  if (pathname === "/projetos/") return 0.8;
  if (pathname === "/blog/") return 0.8;
  if (pathname.startsWith("/blog/")) return 0.7;
  /* A project page is evidence for the offer, so it outranks the policy. */
  if (pathname.startsWith("/projetos/")) return 0.6;
  return 0.3;
};

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
  security: {
    /* Astro hashes its own inline scripts and inline <style> at build time and
       writes them into a per-page <meta> CSP, so the policy never drifts from
       the bundle. Only the origins it cannot know about are listed by hand.
       `frame-ancestors` is deliberately absent: a meta CSP ignores it, and
       `public/_headers` carries X-Frame-Options for that job. */
    csp: {
      algorithm: "SHA-256",
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "media-src 'self'",
        /* Turnstile loads its widget in an iframe and talks back to its own
           origin; nothing else on this site reaches outside. */
        "connect-src 'self' https://challenges.cloudflare.com",
        "frame-src https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        /* Cloudflare injects its Web Analytics beacon at the edge, so it is
           absent from the built HTML and easy to miss when listing origins —
           it was, and the policy blocked it until this line existed. */
        resources: [
          "'self'",
          "https://challenges.cloudflare.com",
          "https://static.cloudflareinsights.com",
        ],
      },
      styleDirective: {
        /* Hashes cover the <style> elements. A handful of style="" attributes
           survive in the markup and cannot be hashed, so they are allowed on
           the attribute directive alone — not on style-src at large. */
        resources: ["'self'", { resource: "'unsafe-inline'", kind: "attribute" }],
      },
    },
  },
  integrations: [
    sitemap({
      /* Astro drops /404/ on its own; this keeps out anything that is a slice
         of another page rather than a page of its own. */
      filter: (page) => !/\/blog\/\d+\/$/.test(new URL(page).pathname),
      serialize: (item) => {
        const pathname = new URL(item.url).pathname;
        const lastmod = postDates.get(pathname);

        return {
          ...item,
          ...(lastmod ? { lastmod } : {}),
          changefreq: pathname.startsWith("/blog/")
            ? ChangeFreqEnum.WEEKLY
            : ChangeFreqEnum.MONTHLY,
          priority: priorityFor(pathname),
        };
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
    define: {
      /* Substituted into both the page markup and the client script, so the
         widget and its mount logic read the same key. */
      "import.meta.env.PUBLIC_TURNSTILE_SITE_KEY": JSON.stringify(TURNSTILE_SITE_KEY),
    },
  },
  build: {
    inlineStylesheets: "auto",
  },
});
