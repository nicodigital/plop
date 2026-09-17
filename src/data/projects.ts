/**
 * Sector groups. The editorial `sector` on each project stays specific — it is
 * what the visitor reads — while `sectorGroup` is the coarse axis the
 * `/projetos/` filter and its routes are built on. Seventeen `rubro` values
 * came in from the portfolio source and eleven of them held a single project,
 * which is a list of links rather than a filter; these six carry enough mass
 * each to be worth clicking.
 */
export const SECTOR_GROUPS = {
  "estudios-e-agencias": "Estúdios e agências",
  "servicos-e-negocios": "Serviços e negócios",
  "saude-e-laboratorios": "Saúde e laboratórios",
  "arquitetura-imoveis-industria": "Arquitetura, imóveis e indústria",
  "profissionais-e-escritorios": "Profissionais e escritórios",
  "educacao-e-instituicoes": "Educação e instituições",
} as const;

export type SectorGroupId = keyof typeof SECTOR_GROUPS;

/** Delivery state. Rendered in pt-BR; the source records it in English. */
export type ProjectStatus = "live" | "wip";

/** How many of the published projects are live, for copy that states it. */
export const liveCount = (): number =>
  PROJECTS.filter((project) => project.status === "live").length;

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  live: "No ar",
  wip: "Em desenvolvimento",
};

/** Build shape of the site, as recorded when it was delivered. */
export type ProjectBuild = "dynamic" | "static" | "one-page" | "ecommerce";

export const BUILD_LABELS: Record<ProjectBuild, string> = {
  dynamic: "Site dinâmico",
  static: "Site estático",
  "one-page": "One page",
  ecommerce: "Loja online",
};

export type Project = {
  /** Stable id, also the media filename stem and the `/projetos/<slug>/` URL. */
  slug: string;
  /** Sector shown in place of the client name. Clients are not named. */
  sector: string;
  /** The filter axis. Coarser than `sector` on purpose. */
  sectorGroup: SectorGroupId;
  /** One factual line about what the site does. No results, no metrics. */
  description: string;
  /** Whether the tile and the project page lead with the scroll capture or a
   *  still screenshot. Only the captured projects have `.webm`/`.mp4`. */
  media: "video" | "shot";
  /** On the home slider. Ten of them, split across the two bands. */
  featured: boolean;
  status: ProjectStatus;
  build: ProjectBuild;
  /** Seconds, from the source capture. Recorded but not currently read. */
  duration?: number;
  /** Live site. Optional: a project without one renders as a plain tile. */
  url?: string;
};

/**
 * Real delivered client sites, captured scrolling or screenshotted. Presented
 * by sector only: no client name and no logo — the tile links to the live
 * site, and that link is the whole of the claim. Nothing here claims a result.
 *
 * Merged from the portfolio source: entries flagged private there are not
 * published here, and one entry was dropped because its client merged into
 * another brand and the domain now redirects elsewhere.
 */
export const PROJECTS: Project[] = [
  /* --- Featured: the ten with a scroll capture, shown on the home slider. --- */
  {
    slug: "moviruta",
    url: "https://moviruta.nicolasgonzalez.dev/",
    sector: "Mobilidade elétrica",
    sectorGroup: "arquitetura-imoveis-industria",
    description:
      "Catálogo de veículos elétricos com pontos de venda e solicitação de orçamento.",
    media: "video",
    featured: true,
    status: "wip",
    build: "dynamic",
    duration: 26,
  },
  {
    slug: "bercetche",
    url: "https://bercetche.com/",
    sector: "Arquitetura",
    sectorGroup: "arquitetura-imoveis-industria",
    description:
      "Site de um estúdio de arquitetura residencial, com o portfólio de projetos como eixo da navegação.",
    media: "video",
    featured: true,
    status: "live",
    build: "dynamic",
    duration: 33,
  },
  {
    slug: "adium",
    url: "https://suprahyalone.com.uy/",
    sector: "Farmacêutica",
    sectorGroup: "saude-e-laboratorios",
    description:
      "Página de produto para um laboratório farmacêutico, explicando indicação e composição a público leigo.",
    media: "video",
    featured: true,
    status: "live",
    build: "one-page",
    duration: 38,
  },
  {
    slug: "alohaus",
    url: "https://alohaus.uy/",
    sector: "Branding e design",
    sectorGroup: "estudios-e-agencias",
    description:
      "Site de um estúdio de branding, construído em torno dos trabalhos e das marcas desenvolvidas.",
    media: "video",
    featured: true,
    status: "live",
    build: "dynamic",
    duration: 28,
  },
  {
    slug: "nomia",
    url: "https://www.nomia.com.uy/sitio/",
    sector: "Cibersegurança",
    sectorGroup: "servicos-e-negocios",
    description:
      "Site institucional de uma consultoria de segurança da informação, com serviços e contato direto.",
    media: "video",
    featured: true,
    status: "live",
    build: "static",
    duration: 19,
  },
  {
    slug: "silentroom",
    url: "https://silentroomstudio.com/",
    sector: "Estúdio audiovisual",
    sectorGroup: "estudios-e-agencias",
    description:
      "Site bilíngue de um estúdio de filmagem e produção musical, apresentando trabalhos e equipe.",
    media: "video",
    featured: true,
    status: "live",
    build: "dynamic",
    duration: 24,
  },
  {
    slug: "buenaventura",
    url: "https://buenaventurafilms.com/",
    sector: "Produtora de cinema",
    sectorGroup: "estudios-e-agencias",
    description:
      "Portfólio de uma produtora audiovisual, com o reel em destaque na primeira tela.",
    media: "video",
    featured: true,
    status: "live",
    build: "dynamic",
    duration: 13,
  },
  {
    slug: "jeydi",
    url: "https://jeydi.com.uy/",
    sector: "Direção criativa",
    sectorGroup: "estudios-e-agencias",
    description:
      "Site de uma diretora criativa, organizado por reel, comerciais e trabalhos curtos.",
    media: "video",
    featured: true,
    status: "live",
    build: "static",
    duration: 23,
  },
  {
    slug: "vetcross",
    url: "https://vetcross.com.uy/",
    sector: "Saúde animal",
    sectorGroup: "saude-e-laboratorios",
    description:
      "Catálogo de produtos veterinários com linha, apresentação e informação técnica por item.",
    media: "video",
    featured: true,
    status: "live",
    build: "dynamic",
    duration: 19,
  },
  {
    slug: "petcremation",
    url: "https://pet-cremation.org/",
    sector: "Serviços pet",
    sectorGroup: "servicos-e-negocios",
    description:
      "Diretório de serviços de cremação de animais, com busca por cidade e estado.",
    media: "video",
    featured: true,
    status: "live",
    build: "dynamic",
    duration: 20,
  },

  /* --- The rest of the delivered work, shown on /projetos/ only. --- */
  {
    slug: "mitra",
    url: "https://mitra.com.uy/",
    sector: "Software e identidade",
    sectorGroup: "estudios-e-agencias",
    description:
      "Site de um estúdio de software e identidade, com os serviços e os trabalhos desenvolvidos.",
    media: "shot",
    featured: false,
    status: "live",
    build: "static",
  },
  {
    slug: "felipe-dg",
    url: "https://www.felipedg.com/",
    sector: "Identidade e marcas",
    sectorGroup: "estudios-e-agencias",
    description:
      "Site de um estúdio de identidade e marcas, construído em torno dos trabalhos.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "pointer",
    url: "https://prueba.pointer.uy/",
    sector: "Imobiliária",
    sectorGroup: "arquitetura-imoveis-industria",
    description:
      "Plataforma de uma imobiliária, com busca de imóveis para compra, venda e aluguel.",
    media: "shot",
    featured: false,
    status: "wip",
    build: "dynamic",
  },
  {
    slug: "habit",
    url: "https://www.habit.com.uy/",
    sector: "Moradia estudantil",
    sectorGroup: "arquitetura-imoveis-industria",
    description:
      "Site de residências estudantis, com os quartos e as áreas comuns de cada unidade.",
    media: "shot",
    featured: false,
    status: "live",
    build: "one-page",
  },
  {
    slug: "zander",
    url: "https://zander.uy/",
    sector: "Máquinas têxteis",
    sectorGroup: "arquitetura-imoveis-industria",
    description:
      "Site de uma empresa de máquinas têxteis, com equipamentos, peças e suporte técnico.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "green-ray-led",
    url: "https://greenrayled.com/",
    sector: "Iluminação LED",
    sectorGroup: "arquitetura-imoveis-industria",
    description:
      "Loja de iluminação LED, com catálogo para uso residencial, comercial e industrial.",
    media: "shot",
    featured: false,
    status: "live",
    build: "ecommerce",
  },
  {
    slug: "cambio-suizo",
    url: "https://www.cambiosuizo.com.uy/",
    sector: "Casa de câmbio",
    sectorGroup: "servicos-e-negocios",
    description:
      "Site de uma casa de câmbio, com cotações e os endereços das agências.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "pulso",
    url: "https://www.pulso.com.uy/",
    sector: "Cuidado domiciliar",
    sectorGroup: "servicos-e-negocios",
    description:
      "Site de um serviço de acompanhamento domiciliar, com assistência pessoal e apoio psicológico.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "sttaff",
    url: "https://sttaff.com.uy/",
    sector: "Recrutamento e seleção",
    sectorGroup: "servicos-e-negocios",
    description:
      "Site de uma empresa de seleção de pessoal, com vagas para candidatos e serviços para empresas.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "i3",
    url: "https://i3.com.uy/",
    sector: "Consultoria em tecnologia",
    sectorGroup: "servicos-e-negocios",
    description:
      "Página única de uma consultoria de tecnologia, com infraestrutura, segurança e desenvolvimento sob medida.",
    media: "shot",
    featured: false,
    status: "live",
    build: "one-page",
  },
  {
    slug: "navegante",
    url: "https://navegante.com.uy/",
    sector: "Malas e mochilas",
    sectorGroup: "servicos-e-negocios",
    description: "Loja de malas e mochilas, com o catálogo dividido por marca.",
    media: "shot",
    featured: false,
    status: "live",
    build: "ecommerce",
  },
  {
    slug: "avp-farma",
    url: "https://avpfarma.com.uy/",
    sector: "Farmacêutica",
    sectorGroup: "saude-e-laboratorios",
    description:
      "Site de um laboratório farmacêutico, com a representação e a distribuição de produtos.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "lsi",
    url: "https://lsi.com.uy/",
    sector: "Dermocosmética",
    sectorGroup: "saude-e-laboratorios",
    description:
      "Página única de um laboratório de dermocosmética, com a linha de produtos para a pele.",
    media: "shot",
    featured: false,
    status: "live",
    build: "one-page",
  },
  {
    slug: "jorge-barrera",
    url: "https://estudiobarrera.com.uy/",
    sector: "Escritório de advocacia",
    sectorGroup: "profissionais-e-escritorios",
    description:
      "Site de um escritório de advocacia, com as áreas de atuação e contato direto.",
    media: "shot",
    featured: false,
    status: "live",
    build: "static",
  },
  {
    slug: "dellavalle-balbi",
    url: "https://dellavallebalbi.com.uy/",
    sector: "Escritório de advocacia",
    sectorGroup: "profissionais-e-escritorios",
    description:
      "Site de um escritório de advocacia, organizado pelas áreas de atuação e pelos dois endereços.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "bull-advisor",
    url: "https://bulladvisors.com.uy/",
    sector: "Consultoria financeira",
    sectorGroup: "profissionais-e-escritorios",
    description:
      "Página única de uma consultoria financeira corporativa, com os serviços de CFO e M&A.",
    media: "shot",
    featured: false,
    status: "live",
    build: "one-page",
  },
  {
    slug: "pro-work-gestion",
    url: "https://proworkgestion.com/",
    sector: "Segurança do trabalho",
    sectorGroup: "profissionais-e-escritorios",
    description:
      "Site de uma consultoria de saúde e segurança do trabalho, com auditorias e treinamentos.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "e2b",
    url: "https://e2b.com.uy/",
    sector: "Ensino de idiomas",
    sectorGroup: "educacao-e-instituicoes",
    description:
      "Página única de um instituto de idiomas, com cursos, exames internacionais e traduções.",
    media: "shot",
    featured: false,
    status: "live",
    build: "one-page",
  },
  {
    slug: "cursos-y-viajes",
    url: "https://cursosyviajes.com/",
    sector: "Cursos e viagens",
    sectorGroup: "educacao-e-instituicoes",
    description:
      "Site de cursos de história, arte e arquitetura, com as viagens organizadas em torno deles.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
  {
    slug: "adur-ciencias",
    url: "https://adurciencias.fcien.edu.uy/",
    sector: "Associação docente",
    sectorGroup: "educacao-e-instituicoes",
    description:
      "Site de uma associação de docentes universitários, com notícias e comunicados.",
    media: "shot",
    featured: false,
    status: "live",
    build: "dynamic",
  },
];

/** The home slider's ten, in the order they were curated. */
export const FEATURED_PROJECTS = PROJECTS.filter((project) => project.featured);

/** Sector groups that actually hold a project, in `SECTOR_GROUPS` order. */
export const usedSectorGroups = (): SectorGroupId[] =>
  (Object.keys(SECTOR_GROUPS) as SectorGroupId[]).filter((id) =>
    PROJECTS.some((project) => project.sectorGroup === id),
  );

export const projectsInGroup = (id: SectorGroupId): Project[] =>
  PROJECTS.filter((project) => project.sectorGroup === id);

export const projectBySlug = (slug: string): Project | undefined =>
  PROJECTS.find((project) => project.slug === slug);
