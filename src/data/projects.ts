export type Project = {
  /** Stable id, also the media filename stem. */
  slug: string;
  /** Sector shown in place of the client name. Clients are not named. */
  sector: string;
  /** One factual line about what the site does. No results, no metrics. */
  description: string;
  /** Seconds, from the source capture. Drives the slide's duration hint. */
  duration: number;
  /** Live site. Optional: a project without one renders as a plain tile. */
  url?: string;
};

/**
 * Real delivered client sites, captured scrolling. Presented by sector only:
 * no client name and no logo — the tile links to the live site, and that link
 * is the whole of the claim. Nothing here claims a result.
 */
export const PROJECTS: Project[] = [
  {
    slug: "moviruta",
    url: "https://moviruta.nicolasgonzalez.dev/",
    sector: "Mobilidade elétrica",
    description:
      "Catálogo de veículos elétricos com pontos de venda e solicitação de orçamento.",
    duration: 26,
  },
  {
    slug: "bercetche",
    url: "https://bercetche.com/",
    sector: "Arquitetura",
    description:
      "Site de um estúdio de arquitetura residencial, com o portfólio de projetos como eixo da navegação.",
    duration: 33,
  },
  {
    slug: "adium",
    url: "https://suprahyalone.com.uy/",
    sector: "Farmacêutica",
    description:
      "Página de produto para um laboratório farmacêutico, explicando indicação e composição a público leigo.",
    duration: 38,
  },
  {
    slug: "alohaus",
    url: "https://alohaus.uy/",
    sector: "Branding e design",
    description:
      "Site de um estúdio de branding, construído em torno dos trabalhos e das marcas desenvolvidas.",
    duration: 28,
  },
  {
    slug: "nomia",
    url: "https://www.nomia.com.uy/sitio/",
    sector: "Cibersegurança",
    description:
      "Site institucional de uma consultoria de segurança da informação, com serviços e contato direto.",
    duration: 19,
  },
  {
    slug: "silentroom",
    url: "https://silentroomstudio.com/",
    sector: "Estúdio audiovisual",
    description:
      "Site bilíngue de um estúdio de filmagem e produção musical, apresentando trabalhos e equipe.",
    duration: 24,
  },
  {
    slug: "buenaventura",
    url: "https://buenaventurafilms.com/",
    sector: "Produtora de cinema",
    description:
      "Portfólio de uma produtora audiovisual, com o reel em destaque na primeira tela.",
    duration: 13,
  },
  {
    slug: "jeydi",
    url: "https://jeydi.com.uy/",
    sector: "Direção criativa",
    description:
      "Site de uma diretora criativa, organizado por reel, comerciais e trabalhos curtos.",
    duration: 23,
  },
  {
    slug: "vetcross",
    url: "https://vetcross.com.uy/",
    sector: "Saúde animal",
    description:
      "Catálogo de produtos veterinários com linha, apresentação e informação técnica por item.",
    duration: 19,
  },
  {
    slug: "petcremation",
    url: "https://pet-cremation.org/",
    sector: "Serviços pet",
    description:
      "Diretório de serviços de cremação de animais, com busca por cidade e estado.",
    duration: 20,
  },
];
