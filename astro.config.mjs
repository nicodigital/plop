// @ts-check
import { defineConfig } from "astro/config";
import sitemap, { ChangeFreqEnum } from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import { SITE_URL } from "./src/data/site.ts";

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
  if (pathname === "/blog/") return 0.8;
  if (pathname.startsWith("/blog/")) return 0.7;
  return 0.3;
};

export default defineConfig({
  site: SITE_URL,
  trailingSlash: "always",
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
  },
  build: {
    inlineStylesheets: "auto",
  },
});
