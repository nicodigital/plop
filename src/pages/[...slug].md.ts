/**
 * Markdown sibling of every page: `/blog/x/` is mirrored at `/blog/x.md`.
 *
 * One endpoint rather than a file per route, so a page added to `textPages()`
 * gets its mirror without a second edit. The pages are discoverable through
 * the `rel="alternate"` link in the layout's head and through `/llms.txt`.
 */
import type { APIRoute, GetStaticPaths } from "astro";
import { renderTextPage, textPages, type TextPage } from "../data/page-markdown.ts";

export const getStaticPaths: GetStaticPaths = async () =>
  (await textPages()).map((page) => ({
    /* `/blog/x.md` → slug `blog/x`. The route contributes the extension. */
    params: { slug: page.mdPath.replace(/^\//, "").replace(/\.md$/, "") },
    props: { page },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(renderTextPage(props.page as TextPage), {
    headers: {
      /* Honoured by `astro dev`. In the static build these are written as
         files and Cloudflare serves them by extension. */
      "content-type": "text/markdown; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
