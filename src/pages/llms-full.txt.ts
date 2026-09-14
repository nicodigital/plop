/**
 * `/llms-full.txt` — every page of the site as one markdown document, for a
 * model that would rather read once than follow a dozen links. Same source as
 * the `.md` siblings, concatenated in reading order.
 */
import type { APIRoute } from "astro";
import { renderTextPage, textPages } from "../data/page-markdown.ts";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "../data/site.ts";

export const GET: APIRoute = async () => {
  const pages = await textPages();
  const updatedAt = pages
    .map((page) => page.updatedAt)
    .filter((date): date is Date => Boolean(date))
    .sort((a, b) => b.getTime() - a.getTime())[0]
    ?.toISOString()
    .slice(0, 10) ?? "";

  const body = [
    `# ${SITE_NAME} — conteúdo completo`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    /* Dated by the newest content, not by the build clock: a rebuild that
       changed nothing should produce a byte-identical file. */
    `Fonte: ${SITE_URL}/ · ${pages.length} páginas · atualizado em ${updatedAt}`,
    "",
    ...pages.flatMap((page) => ["", "=".repeat(72), "", renderTextPage(page)]),
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
