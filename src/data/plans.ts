export type Plan = {
  slug: string;
  name: string;
  /** Who the plan is for. Read before the price. */
  audience: string;
  /** Entry payment in BRL. */
  setup: number;
  /** Recurring monthly fee in BRL. */
  monthly: number;
  /** True when the entry price is a starting point, not a closed figure. */
  setupFrom?: boolean;
  features: string[];
  recommended?: boolean;
  /**
   * Whether the price is commercially confirmed. Essencial and Completo are
   * working figures awaiting confirmation; this flag is for the team and is
   * never rendered to visitors.
   */
  priceConfirmed: boolean;
};

export const PLANS: Plan[] = [
  {
    slug: "essencial",
    name: "Essencial",
    audience: "Para quem precisa existir no Google e no WhatsApp, sem mais nada.",
    setup: 900,
    monthly: 200,
    priceConfirmed: false,
    features: [
      "Uma página, feita sob medida",
      "Formulário e botão de WhatsApp",
      "Hospedagem inclusa",
      "Suporte técnico",
      "Manutenção e atualizações",
    ],
  },
  {
    slug: "profissional",
    name: "Profissional",
    audience: "Para quem quer aparecer no Google publicando com regularidade.",
    setup: 1500,
    monthly: 300,
    recommended: true,
    priceConfirmed: true,
    features: [
      "Uma página, feita sob medida",
      "Blog completo",
      "Formulário e botão de WhatsApp",
      "Hospedagem inclusa",
      "Suporte técnico",
      "Manutenção e atualizações",
      "Publicação de 1 conteúdo por mês",
    ],
  },
  {
    slug: "completo",
    name: "Completo",
    audience: "Para quem tem várias linhas de serviço ou produto para explicar.",
    setup: 3000,
    setupFrom: true,
    monthly: 450,
    priceConfirmed: false,
    features: [
      "Site de várias páginas",
      "Blog completo",
      "Formulário e botão de WhatsApp",
      "Hospedagem inclusa",
      "Suporte técnico prioritário",
      "Manutenção e atualizações",
      "Publicação de 1 conteúdo por mês",
    ],
  },
];

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
