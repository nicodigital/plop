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
import { PLANS, entryPrice, formatBRL } from "./plans.ts";
import {
  BUILD_LABELS,
  FEATURED_PROJECTS,
  PROJECTS,
  SECTOR_GROUPS,
  liveCount,
  STATUS_LABELS,
  projectsInGroup,
  usedSectorGroups,
} from "./projects.ts";
import {
  ADDRESS,
  AUTHOR,
  CNPJ,
  CONTACT_EMAIL,
  HAS_WHATSAPP,
  PHONE_DISPLAY,
  LOCAL_SUMMARY,
  SERVICE_AREA_CITIES,
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
const HOME_PROSE = `${SITE_NAME} desenvolve sites para negócios independentes no Brasil: sites modernos,
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

/** "a, b e c" — the list read as a sentence rather than as data. */
const asSentence = (items: readonly string[]): string =>
  items.join(", ").replace(/, ([^,]*)$/, " e $1");

/**
 * The studio's own paragraph, mirroring the `Studio` section on the page.
 * It is the only place either surface states the city in prose, so the two
 * are written from the same facts: the service areas come from the constant
 * the Business Profile is kept in step with, and the entry price from the
 * plans.
 */
const studioSection = (): string =>
  [
    "## O estúdio",
    "",
    `${SITE_NAME} é um estúdio de criação de sites em Curitiba, no Paraná. O`,
    "trabalho é feito a distância, por mensagem e por chamada, e o atendimento é",
    "em português, espanhol e inglês.",
    "",
    `A entrada começa em ${formatBRL(entryPrice())}, paga uma vez. A mensalidade cobre`,
    "hospedagem, suporte técnico, manutenção e atualizações — e, nos planos com",
    "blog, a publicação de um conteúdo por mês. O site vai ao ar em semanas, não",
    "há painel para aprender nem plugin para atualizar, e o domínio fica no seu",
    "nome.",
    "",
    `Áreas de atendimento: ${asSentence(SERVICE_AREA_CITIES)}.`,
  ].join("\n");

const homeBody = (): string =>
  [
    HOME_PROSE,
    "",
    studioSection(),
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
    /* The home slider shows the featured ten, so the mirror of the home shows
       the same ten. The rest are on /projetos/, which has a mirror of its own
       — a page's markdown must not claim content the page does not carry. */
    FEATURED_PROJECTS.map(
      (project) =>
        `- **${project.sector}** — ${project.description}${project.url ? ` (${project.url})` : ""}`,
    ).join("\n"),
    "",
    `Os outros ${PROJECTS.length - FEATURED_PROJECTS.length} projetos entregues estão em ${abs(mdPathFor("/projetos/"))}.`,
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
    `- ${LOCAL_SUMMARY}`,
    "- Atendimento em português, espanhol e inglês.",
    `- CNPJ: ${CNPJ}`,
  ].join("\n");

/**
 * The whole body of work as one document, grouped the way the page groups it.
 *
 * Each project has an HTML page of its own but no separate markdown mirror:
 * thirty-three files of four lines each would bury the pages that carry the
 * offer, and everything those pages say is already here. The links point at
 * the HTML, which is where a reader should land.
 */
const projectsIndexPage = (): TextPage => ({
  path: "/projetos/",
  mdPath: mdPathFor("/projetos/"),
  title: "Projetos",
  description: `${liveCount()} sites de clientes reais no ar, apresentados por setor — quem contratou não é nomeado.`,
  meta: [
    `Projetos: ${PROJECTS.length}`,
    `No ar: ${liveCount()}`,
    `Em desenvolvimento: ${PROJECTS.length - liveCount()}`,
    `Setores: ${usedSectorGroups().length}`,
  ],
  body: [
    "Cada projeto abaixo é um site real de um cliente real. Os marcados como",
    "\"No ar\" estão publicados no endereço indicado; os marcados como \"Em",
    "desenvolvimento\" ainda estão sendo construídos. Apresentamos por setor:",
    "os nomes dos clientes ficam com eles, e o link é a prova.",
    "",
    usedSectorGroups()
      .map((group) =>
        [
          `## ${SECTOR_GROUPS[group]}`,
          "",
          projectsInGroup(group)
            .map((project) =>
              [
                `### ${project.sector}`,
                "",
                project.description,
                "",
                `- Página: ${abs(`/projetos/${project.slug}/`)}`,
                ...(project.url ? [`- Site: ${project.url}`] : []),
                `- Tipo: ${BUILD_LABELS[project.build]}`,
                `- Status: ${STATUS_LABELS[project.status]}`,
              ].join("\n"),
            )
            .join("\n\n"),
        ].join("\n"),
      )
      .join("\n\n"),
  ].join("\n"),
  section: "site",
});

/**
 * The about page as text.
 *
 * Like `HOME_PROSE`, this restates copy that lives inside a `.astro`
 * component and cannot be read back out of it — the second and last exception
 * in this module. The *numbers* are not restated: every figure below is
 * interpolated from the same constants the page interpolates, so the page and
 * its mirror can disagree about wording but never about a fact.
 */
const aboutPage = (): TextPage => ({
  path: "/sobre/",
  mdPath: mdPathFor("/sobre/"),
  title: `Sobre o ${SITE_NAME}`,
  description: `Quem faz os sites do ${SITE_NAME}: ${AUTHOR.name}, desenvolvedor em Curitiba há mais de ${AUTHOR.yearsBuilding} anos, com mais de ${AUTHOR.sitesBuilt} sites construídos.`,
  meta: [
    `Responsável: ${AUTHOR.name}`,
    `Função: ${AUTHOR.role}`,
    `Base: ${ADDRESS.city}, ${ADDRESS.regionName}, ${ADDRESS.country}`,
    "Idiomas: português, espanhol, inglês",
    `Anos construindo sites: mais de ${AUTHOR.yearsBuilding}`,
    `Sites construídos: mais de ${AUTHOR.sitesBuilt}`,
    ...AUTHOR.profiles.map((profile) => `Perfil: ${profile}`),
    `Projetos no portfólio: ${PROJECTS.length}`,
    `Desses, no ar: ${liveCount()}`,
  ],
  body: [
    "## Quem faz",
    "",
    `${AUTHOR.name} é desenvolvedor web e é quem desenha, constrói, publica e`,
    `mantém os sites do ${SITE_NAME}. Não há equipe de atendimento no meio: quem`,
    "responde o primeiro e-mail é quem mexe no código.",
    "",
    `Faz sites há mais de ${AUTHOR.yearsBuilding} anos e já entregou mais de ${AUTHOR.sitesBuilt}. A maior`,
    "parte não está no portfólio deste site: projetos mudam de mãos, são",
    "refeitos por outra pessoa, saem do ar, ou são de clientes que preferem não",
    "aparecer.",
    "",
    `O portfólio publicado tem ${PROJECTS.length} projetos — ${liveCount()} no ar agora e`,
    `${PROJECTS.length - liveCount()} em desenvolvimento — em ${new Set(PROJECTS.map((p) => p.sector)).size} setores diferentes:`,
    "arquitetura, farmacêutica, cinema, cibersegurança, saúde animal,",
    "imobiliária, ensino, entre outros. A maior parte foi para clientes no",
    `Uruguai, onde esse trabalho começou. O estúdio hoje é em ${ADDRESS.city}, e o`,
    "atendimento é em português, espanhol e inglês.",
    "",
    `Áreas de atendimento declaradas no Perfil da Empresa: ${asSentence(SERVICE_AREA_CITIES)}.`,
    "O trabalho é remoto, então o Brasil inteiro está dentro do alcance.",
    "",
    "## Como a gente trabalha",
    "",
    `O modelo cabe em duas parcelas: uma entrada para construir o site, a partir`,
    `de ${formatBRL(entryPrice())}, e uma mensalidade que o mantém no ar, cuidado e`,
    "atualizado. Não há orçamento por hora nem surpresa no terceiro mês.",
    "",
    "As páginas já saem prontas e são servidas do ponto mais próximo de quem as",
    "abriu, o que é o que faz um site aguentar o mês de maior procura. O domínio",
    "fica sempre no nome do cliente.",
    "",
    "## O que não fazemos",
    "",
    "- Entregar e sumir: um site sem manutenção não fica parado, fica velho.",
    "- Prometer primeiro lugar no Google, que ninguém pode prometer.",
    "- Esconder o preço: os três planos estão publicados, com os dois números",
    "  de cada um.",
  ].join("\n"),
  section: "site",
});

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
    "Textos diretos sobre sites, performance e presença digital para quem toca o próprio negócio, sem jargão e sem curso.",
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
      title: `${SITE_NAME} — sites profissionais para negócios independentes`,
      description: SITE_DESCRIPTION,
      meta: [`Idioma: português (Brasil)`, "Atendimento: Brasil"],
      body: homeBody(),
      section: "site",
    },
    aboutPage(),
    projectsIndexPage(),
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
