/**
 * `/robots.txt` as an endpoint rather than a file in `public/`, so the sitemap
 * URL is derived from `SITE_URL` instead of being retyped next to it.
 *
 * The AI crawlers are named one by one on purpose. A bare `User-agent: *` only
 * means "not forbidden"; an explicit block is the difference between being
 * tolerated and being invited, and this site wants to be read by them — that
 * is what `/llms.txt` and the `.md` siblings exist for.
 */
import type { APIRoute } from "astro";
import { SITE_URL } from "../data/site.ts";

/** Retrieval and training agents we want reading the site. */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "meta-externalagent",
  "Amazonbot",
  "Bytespider",
  "CCBot",
];

export const GET: APIRoute = () => {
  const body = [
    "User-agent: *",
    "Allow: /",
    /* The contact handler on the Worker. Nothing to index and nothing a
       crawler should be POSTing to. */
    "Disallow: /api/",
    "",
    /* Each named group repeats the disallow. A crawler that matches a group
       by name ignores the wildcard group entirely, rules included, so without
       this line every agent above is told /api/ is fair game. */
    ...AI_AGENTS.flatMap((agent) => [
      `User-agent: ${agent}`,
      "Allow: /",
      "Disallow: /api/",
      "",
    ]),
    "# Conteúdo em texto para leitura por IA:",
    `# ${SITE_URL}/llms.txt`,
    `# ${SITE_URL}/llms-full.txt`,
    "",
    `Sitemap: ${SITE_URL}/sitemap-index.xml`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=86400",
    },
  });
};
