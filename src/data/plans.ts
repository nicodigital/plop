export type Plan = {
  slug: string;
  name: string;
  /** Who the plan is for. Read before the price. */
  audience: string;
  /** Entry payment in BRL. Zero means the plan has no entry at all. */
  setup: number;
  /** Recurring monthly fee in BRL. */
  monthly: number;
  /** True when the entry price is a starting point, not a closed figure. */
  setupFrom?: boolean;
  features: string[];
  recommended?: boolean;
  /**
   * Where the card's button leads. `preview` opens WhatsApp asking for the
   * free preview; `contact` scrolls to the form with the plan already named.
   */
  cta: { label: string; kind: "preview" | "contact" };
};

export const PLANS: Plan[] = [
  {
    slug: "basico",
    name: "Básico",
    audience: "Para quem precisa existir no Google e no WhatsApp, sem mais nada.",
    setup: 0,
    monthly: 200,
    cta: { label: "Quero o Básico", kind: "contact" },
    features: [
      "Uma página, feita sob medida",
      "Otimizado para dispositivos móveis",
      "Otimizado para IA",
      "Formulário e botão de WhatsApp",
      "Hospedagem inclusa",
      "Otimização básica de SEO",
      "Suporte técnico",
      "Manutenção e atualizações",
      "1 conta de e-mail inclusa **",
    ],
  },
  {
    slug: "promocao",
    name: "Inteligente",
    audience:
      "Seu site começa sem custo de criação. A Plop! desenvolve sua página inicial e você começa a pagar somente quando o site estiver pronto para entrar no ar.",
    setup: 0,
    monthly: 297,
    recommended: true,
    cta: { label: "Prévia do site de graça", kind: "preview" },
    features: [
      "Uma página, feita sob medida",
      "Otimizado para dispositivos móveis",
      "Otimizado para IA",
      "Blog completo",
      "Formulário e botão de WhatsApp",
      "Hospedagem inclusa",
      "Otimização básica de SEO",
      "Suporte técnico",
      "Manutenção e atualizações",
      "Publicação de 1 conteúdo por mês *",
      "Chatbot com IA",
      "1 conta de e-mail inclusa **",
    ],
  },
  {
    slug: "customizado",
    name: "Customizado",
    audience: "Para desenvolver sites mais complexos e com outras funcionalidades.",
    setup: 3000,
    setupFrom: true,
    monthly: 100,
    cta: { label: "Quero o Customizado", kind: "contact" },
    features: [
      "Site de várias páginas",
      "Otimizado para dispositivos móveis",
      "Otimizado para IA",
      "Formulário e botão de WhatsApp",
      "Hospedagem inclusa",
      "Otimização básica de SEO",
      "Suporte técnico prioritário",
      "Manutenção e atualizações",
      "1 conta de e-mail inclusa **",
    ],
  },
];

/**
 * The notes printed under the cards. Each `mark` matches the asterisks a
 * feature ends with above, so the limit sits next to the plan it qualifies.
 */
export const PLAN_NOTES: { mark?: string; text: string }[] = [
  {
    mark: "*",
    text: "Publicação de 1 conteúdo por mês: 1 solicitação de atualização de conteúdo por mês, de até 30 minutos de trabalho.",
  },
  {
    mark: "**",
    text: "1 conta de e-mail inclusa: é possível contratar mais contas de e-mail separadamente.",
  },
  {
    text: "O domínio fica no seu nome. Se um dia você quiser levar o site para outro lugar, ele vai com você.",
  },
];

/** A feature without its note marker, for surfaces that do not print the notes. */
export const featureLabel = (feature: string): string => feature.replace(/\s*\*+$/, "");

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/**
 * The lowest monthly fee — the "a partir de" figure the home, the meta copy and
 * the Organization graph quote, derived once so they cannot disagree with the
 * cards.
 */
export const monthlyPrice = (): number => Math.min(...PLANS.map((plan) => plan.monthly));

/**
 * The no-entry plan the rest of the site quotes. Básico and Inteligente both
 * start with no entry; the hero, the final CTA and the studio name the
 * recommended one.
 */
export const freeEntryPlan = (): Plan | undefined =>
  PLANS.find((plan) => plan.recommended && plan.setup === 0) ??
  PLANS.find((plan) => plan.setup === 0);

/**
 * The monthly fee of the no-entry plan. Sentences that name the Inteligente quote
 * this, not `monthlyPrice()`: the plans no longer share one fee.
 */
export const freeEntryMonthly = (): number => (freeEntryPlan() ?? PLANS[0]).monthly;

/**
 * The entry as a phrase, the way every text surface (markdown mirror,
 * llms.txt, JSON-LD) states it. "R$ 0" reads as a typo; "sem entrada" is the
 * offer.
 */
export const entryLabel = (plan: Plan): string => {
  if (plan.setup === 0) return "sem entrada, sem fidelidade";
  return `${plan.setupFrom ? "a partir de " : ""}${formatBRL(plan.setup)}`;
};
