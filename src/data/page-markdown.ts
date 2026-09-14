/**
 * Plain-text mirrors of the site.
 *
 * Search engines read the rendered HTML, but an LLM reads text — and the copy
 * on this site is spread across animated `.astro` sections, a Swiper slider
 * and JSON-LD. This module assembles the same content as markdown, once, so
 * that `/llms.txt`, `/llms-full.txt` and every `.md` sibling URL are three
 * views of one source and cannot disagree.
 *
 * Where the text already exists as content it is reused verbatim — blog posts
 * and the privacy policy hand over their collection body untouched. Where it
 * exists as data it is composed from that data, so a price edited in
 * `plans.ts` moves here on the same commit. Only the home's headline prose has
 * to be restated, because it lives inside components; `HOME_PROSE` is that
 * exception and nothing else belongs in it.
 */
import { getCollection, type CollectionEntry } from "astro:content";
import { BLOG_CATEGORIES, BLOG_AUTHOR, formatPostDate } from "./blog.ts";
import { FAQ } from "./faq.ts";
import { PLANS, formatBRL } from "./plans.ts";
import { PROJECTS } from "./projects.ts";
import {
  CONTACT_EMAIL,
  HAS_WHATSAPP,
  PHONE_DISPLAY,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
} from "./site.ts";

export type TextPage = {
  /** Canonical HTML route, with the trailing slash the site is built with. */
  path: string;
  /** Its markdown sibling. */
  mdPath: string;
  title: string;
  description: string;
  /** `Key: value` lines rendered under the description. */
  meta: string[];
  /** Body markdown, starting at heading level two. */
  body: string;
  /** Drives sitemap-style ordering and the `llms.txt` sections. */
  section: "site" | "blog";
  /** Last meaningful change, when the source knows one. */
  updatedAt?: Date;
};

/** `/` → `/index.md`, `/blog/x/` → `/blog/x.md`. */
export const mdPathFor = (path: string): string =>
  path === "/" ? "/index.md" : `${path.replace(/\/+$/, "")}.md`;

const abs = (path: string) => new URL(path, SITE_URL).href;

/**
 * The home's opening argument, which lives inside `Hero.astro` and
 * `About.astro` as animated spans and cannot be read back out of them. Keep it
 * to the claims those sections actually make — everything below this constant
 * is generated from data and needs no maintenance.
 */
const HOME_PROSE = `${SITE_NAME} desenvolve sites para pequenos negócios no Brasil: sites modernos,
rápidos e fáceis de gerenciar, com design de alto desempenho e um preço que faz
sentido — e já preparados para aparecer em buscadores e em ferramentas de
inteligência artificial.

O serviço não termina na entrega. Cada plano é um site publicado mais um
cuidado mensal: hospedagem inclusa, suporte técnico quando precisar, manutenção
e atualizações, e nos planos com blog a publicação de um conteúdo por mês. Você
cuida do seu negócio e a gente cuida do seu site — no ar em semanas, sem painel
para aprender e sem plugin para atualizar.`;

const planSection = (plan: (typeof PLANS)[number]): string => {
  const entry = plan.setupFrom
    ? `a partir de ${formatBRL(plan.setup)}`
    : formatBRL(plan.setup);

  return [
    `### ${plan.name}${plan.recommended ? " (mais escolhido)" : ""}`,
    "",
    plan.audience,
    "",
    `- Entrada: ${entry}`,
    `- Mensalidade: ${formatBRL(plan.monthly)}`,
    "",
    "Inclui:",
    "",
    ...plan.features.map((feature) => `- ${feature}`),
  ].join("\n");
};

const homeBody = (): string =>
  [
    HOME_PROSE,
    "",
    "## Planos",
    "",
    "Todos os planos têm duas parcelas e nada mais: uma entrada única e uma",
    "mensalidade que cobre hospedagem, suporte e manutenção. O domínio fica no",
    "seu nome.",
    "",
    PLANS.map(planSection).join("\n\n"),
    "",
    "## Projetos entregues",
    "",
    "Sites reais de clientes reais, apresentados por setor — quem contratou não",
    "é nomeado. O link é a prova.",
    "",
    PROJECTS.map(
      (project) =>
        `- **${project.sector}** — ${project.description}${project.url ? ` (${project.url})` : ""}`,
    ).join("\n"),
    "",
    "## Perguntas frequentes",
    "",
    FAQ.map((item) => `### ${item.question}\n\n${item.answer}`).join("\n\n"),
    "",
    "## Contato",
    "",
    `- E-mail: ${CONTACT_EMAIL}`,
    ...(HAS_WHATSAPP ? [`- WhatsApp: ${PHONE_DISPLAY}`] : []),
    `- Formulário: ${abs("/#contato")}`,
    "- Atendimento em português, espanhol e inglês.",
  ].join("\n");

const postPath = (post: CollectionEntry<"blog">) => `/blog/${post.id}/`;

const postPage = (post: CollectionEntry<"blog">): TextPage => ({
  path: postPath(post),
  mdPath: mdPathFor(postPath(post)),
  title: post.data.title,
  description: post.data.description,
  meta: [
    `Publicado: ${formatPostDate(post.data.publishedAt)}`,
    ...(post.data.updatedAt
      ? [`Atualizado: ${formatPostDate(post.data.updatedAt)}`]
      : []),
    `Categoria: ${BLOG_CATEGORIES[post.data.category]}`,
    `Leitura: ${post.data.readingMinutes} min`,
    `Autor: ${BLOG_AUTHOR}`,
  ],
  /* The post's own markdown, untouched. This is the whole reason the mirror
     is worth having: no conversion step to lose a heading or a list. */
  body: post.body?.trim() ?? "",
  section: "blog",
  updatedAt: post.data.updatedAt ?? post.data.publishedAt,
});

const blogIndexPage = (posts: CollectionEntry<"blog">[]): TextPage => ({
  path: "/blog/",
  mdPath: mdPathFor("/blog/"),
  title: "Blog",
  description:
    "Textos diretos sobre sites, performance e presença digital para quem toca um negócio pequeno, sem jargão e sem curso.",
  meta: [`Artigos: ${posts.length}`],
  body: [
    "## Artigos",
    "",
    posts
      .map(
        (post) =>
          `- [${post.data.title}](${abs(mdPathFor(postPath(post)))}) — ${formatPostDate(post.data.publishedAt, "short")} · ${BLOG_CATEGORIES[post.data.category]}\n  ${post.data.description}`,
      )
      .join("\n"),
  ].join("\n"),
  section: "blog",
  updatedAt: posts[0]?.data.publishedAt,
});

/**
 * Every text surface on the site, in the order a reader should meet them:
 * the offer, the legal page, then the blog newest first.
 */
export const textPages = async (): Promise<TextPage[]> => {
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.publishedAt.getTime() - a.data.publishedAt.getTime(),
  );
  const legal = await getCollection("legal");

  return [
    {
      path: "/",
      mdPath: mdPathFor("/"),
      title: `${SITE_NAME} — sites profissionais para pequenos negócios`,
      description: SITE_DESCRIPTION,
      meta: [`Idioma: português (Brasil)`, "Atendimento: Brasil"],
      body: homeBody(),
      section: "site",
    },
    ...legal.map((entry) => ({
      path: `/${entry.id}/`,
      mdPath: mdPathFor(`/${entry.id}/`),
      title: entry.data.title,
      description: entry.data.description,
      meta: [`Atualizado: ${formatPostDate(entry.data.updatedAt)}`],
      body: entry.body?.trim() ?? "",
      section: "site" as const,
      updatedAt: entry.data.updatedAt,
    })),
    blogIndexPage(posts),
    ...posts.map(postPage),
  ];
};

/**
 * One page as a standalone markdown document: title, summary, the facts a
 * reader needs to cite it, then the body. The canonical HTML URL is stated
 * explicitly so a model quoting this file links to the page, not to the
 * mirror.
 */
export const renderTextPage = (page: TextPage): string =>
  [
    `# ${page.title}`,
    "",
    `> ${page.description}`,
    "",
    `URL: ${abs(page.path)}`,
    ...page.meta,
    "",
    "---",
    "",
    page.body,
    "",
    "---",
    "",
    `${SITE_NAME} — ${abs("/")}`,
  ].join("\n");
