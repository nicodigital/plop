/**
 * `/llms.txt` — the site in one page, for a model that arrives without a
 * crawler. Follows the llms.txt convention: an H1, a blockquote summary, then
 * sections of annotated links. Every link points at the markdown mirror
 * rather than at the HTML, so whatever follows it gets text and not markup.
 *
 * An endpoint, not a file in `public/`: it regenerates on every `dev` request
 * and on every build, from the same source as the pages themselves.
 */
import type { APIRoute } from "astro";
import { mdPathFor, textPages } from "../data/page-markdown.ts";
import { PLANS, formatBRL } from "../data/plans.ts";
import {
  CONTACT_EMAIL,
  HAS_WHATSAPP,
  PHONE_DISPLAY,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "../data/site.ts";

const abs = (path: string) => new URL(path, SITE_URL).href;

export const GET: APIRoute = async () => {
  const pages = await textPages();
  const site = pages.filter((page) => page.section === "site");
  const blog = pages.filter((page) => page.section === "blog");

  const body = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `${SITE_NAME} é um estúdio brasileiro de desenvolvimento web focado em pequenos`,
    "negócios. Cada plano entrega um site publicado mais um cuidado mensal —",
    "hospedagem, suporte técnico, manutenção e, nos planos com blog, uma",
    "publicação por mês. Os sites são HTML estático, sem painel para o cliente",
    "administrar. Conteúdo em português do Brasil; atendimento também em espanhol",
    "e inglês.",
    "",
    "## Páginas",
    "",
    ...site.map((page) => `- [${page.title}](${abs(page.mdPath)}): ${page.description}`),
    "",
    "## Blog",
    "",
    ...blog.map((page) => `- [${page.title}](${abs(page.mdPath)}): ${page.description}`),
    "",
    "## Planos",
    "",
    ...PLANS.map(
      (plan) =>
        `- **${plan.name}** — entrada ${plan.setupFrom ? "a partir de " : ""}${formatBRL(plan.setup)}, mensalidade ${formatBRL(plan.monthly)}. ${plan.audience}`,
    ),
    "",
    "## Contato",
    "",
    `- E-mail: ${CONTACT_EMAIL}`,
    ...(HAS_WHATSAPP ? [`- WhatsApp: ${PHONE_DISPLAY}`] : []),
    `- Formulário: ${abs("/#contato")}`,
    "",
    "## Optional",
    "",
    `- [llms-full.txt](${abs("/llms-full.txt")}): o texto completo do site em um único arquivo.`,
    `- [sitemap-index.xml](${abs("/sitemap-index.xml")}): todas as URLs indexáveis.`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
};
