export type Project = {
  /** Stable id, also the media filename stem. */
  slug: string;
  /** Sector shown in place of the client name. Clients are not named. */
  sector: string;
  /** One factual line about what the site does. No results, no metrics. */
  description: string;
  /** Seconds, from the source capture. Drives the slide's duration hint. */
  duration: number;
};

/**
 * Real delivered client sites, captured scrolling. Presented by sector only:
 * no client name, no logo, no outbound link. Nothing here claims a result.
 */
export const PROJECTS: Project[] = [
  {
    slug: "moviruta",
    sector: "Mobilidade elétrica",
    description:
      "Catálogo de veículos elétricos com pontos de venda e solicitação de orçamento.",
    duration: 26,
  },
{
    slug: "bercetche",
    sector: "Arquitetura",
    description:
      "Site de um estúdio de arquitetura residencial, com o portfólio de projetos como eixo da navegação.",
    duration: 33,
  },
{
    slug: "adium",
    sector: "Farmacêutica",
    description:
      "Página de produto para um laboratório farmacêutico, explicando indicação e composição a público leigo.",
    duration: 38,
  },
{
    slug: "alohaus",
    sector: "Branding e design",
    description:
      "Site de um estúdio de branding, construído em torno dos trabalhos e das marcas desenvolvidas.",
    duration: 28,
  },
{
    slug: "nomia",
    sector: "Cibersegurança",
    description:
      "Site institucional de uma consultoria de segurança da informação, com serviços e contato direto.",
    duration: 19,
  },
{
    slug: "silentroom",
    sector: "Estúdio audiovisual",
    description:
      "Site bilíngue de um estúdio de filmagem e produção musical, apresentando trabalhos e equipe.",
    duration: 24,
  },
{
    slug: "buenaventura",
    sector: "Produtora de cinema",
    description:
      "Portfólio de uma produtora audiovisual, com o reel em destaque na primeira tela.",
    duration: 13,
  },
{
    slug: "jeydi",
    sector: "Direção criativa",
    description:
      "Site de uma diretora criativa, organizado por reel, comerciais e trabalhos curtos.",
    duration: 23,
  },
{
    slug: "vetcross",
    sector: "Saúde animal",
    description:
      "Catálogo de produtos veterinários com linha, apresentação e informação técnica por item.",
    duration: 19,
  },
{
    slug: "petcremation",
    sector: "Serviços pet",
    description:
      "Diretório de serviços de cremação de animais, com busca por cidade e estado.",
    duration: 20,
  },
];
