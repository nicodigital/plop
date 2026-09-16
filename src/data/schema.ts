/**
 * JSON-LD builders.
 *
 * Structured data is content, not presentation, so it is assembled here from
 * the same modules the pages render — `PLANS`, `PROJECTS`, `FAQ` — and never
 * retyped inside a template. A price that changes in `plans.ts` changes in the
 * rich result on the same edit.
 *
 * Everything is linked by `@id` rather than repeated: one Organization node
 * and one WebSite node exist for the whole site, and every page graph points
 * at them. That is what lets a crawler read the pages as one publisher instead
 * of as a dozen unrelated businesses that happen to share a name.
 */
import { FAQ } from "./faq.ts";
import { PLANS, entryPrice, formatBRL } from "./plans.ts";
import { PROJECTS, type Project } from "./projects.ts";
import {
  CONTACT_EMAIL,
  HAS_WHATSAPP,
  OG_IMAGE,
  PHONE_NUMBER,
  SITE_NAME,
  SITE_URL,
  WHATSAPP_NUMBER,
} from "./site.ts";

export type JsonLd = Record<string, unknown>;

/** Stable node identifiers. Referenced, never duplicated. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

const abs = (path: string) => new URL(path, SITE_URL).href;

/** Every node that names the publisher points here. */
const publisherRef = { "@id": ORGANIZATION_ID };

/**
 * The business itself. `ProfessionalService` rather than `Organization`: it
 * inherits LocalBusiness, which is what carries the price range, the service
 * area and the contact channels a service rich result reads.
 */
export const organizationSchema = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": ORGANIZATION_ID,
  name: SITE_NAME,
  alternateName: "PLOP",
  url: SITE_URL,
  logo: {
    "@type": "ImageObject",
    url: abs("/favicon.svg"),
    caption: SITE_NAME,
  },
  image: abs(OG_IMAGE),
  description:
    "Desenvolvimento de sites profissionais para negócios independentes, com hospedagem, suporte e manutenção mensal.",
  email: CONTACT_EMAIL,
  ...(HAS_WHATSAPP ? { telephone: PHONE_NUMBER } : {}),
  areaServed: { "@type": "Country", name: "Brasil" },
  serviceType: "Desenvolvimento de sites",
  knowsLanguage: ["pt-BR", "es", "en"],
  /* The entry price of the cheapest plan upward — the figure the cards show,
     so the rich result and the page can never disagree. */
  priceRange: `${formatBRL(entryPrice())}+`,
  ...(HAS_WHATSAPP
    ? {
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "sales",
          telephone: PHONE_NUMBER,
          email: CONTACT_EMAIL,
          availableLanguage: ["Portuguese", "Spanish", "English"],
        },
        sameAs: [`https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, "")}`],
      }
    : {}),
});

export const websiteSchema = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: SITE_NAME,
  url: SITE_URL,
  inLanguage: "pt-BR",
  publisher: publisherRef,
});

/**
 * A page's place in the site. Passed the trail without the site root, which is
 * always position one.
 */
export const breadcrumbSchema = (
  trail: { name: string; path?: string }[],
): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Início", item: abs("/") },
    ...trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 2,
      name: crumb.name,
      /* The last crumb is the current page and carries no `item`: it is where
         the visitor already is, and Google reads a trailing self-link as one
         more hop. */
      ...(crumb.path ? { item: abs(crumb.path) } : {}),
    })),
  ],
});

/**
 * The questions as they are rendered. Answers are plain strings in `faq.ts`,
 * so nothing has to be stripped of markup here.
 */
export const faqSchema = (): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  inLanguage: "pt-BR",
  mainEntity: FAQ.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
});

/**
 * One plan as a `Service` with both of its numbers: the entry payment as the
 * offer's price, and the monthly fee as a recurring `UnitPriceSpecification`.
 * A plan that says "two numbers and no more" has to say it in the markup too —
 * an offer carrying only the setup fee would read as the whole cost.
 *
 * `anchorOn` is the page the plan's own fragment lives on, so the offer points
 * at a card the visitor can actually land on.
 */
const planService = (plan: (typeof PLANS)[number], anchorOn: string): JsonLd => ({
  "@type": "Service",
  name: `${plan.name} — ${SITE_NAME}`,
  description: plan.audience,
  serviceType: "Desenvolvimento e manutenção de sites",
  url: abs(`${anchorOn}#${plan.slug}`),
  areaServed: { "@type": "Country", name: "Brasil" },
  provider: publisherRef,
  offers: {
    "@type": "Offer",
    priceCurrency: "BRL",
    price: plan.setup,
    availability: "https://schema.org/InStock",
    description: `Entrada de ${formatBRL(plan.setup)} mais ${formatBRL(plan.monthly)} por mês.`,
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        name: plan.setupFrom ? "Entrada, a partir de" : "Entrada",
        price: plan.setup,
        priceCurrency: "BRL",
        valueAddedTaxIncluded: true,
      },
      {
        "@type": "UnitPriceSpecification",
        name: "Mensalidade",
        price: plan.monthly,
        priceCurrency: "BRL",
        valueAddedTaxIncluded: true,
        billingIncrement: 1,
        unitCode: "MON",
        billingDuration: 1,
        referenceQuantity: {
          "@type": "QuantitativeValue",
          value: 1,
          unitCode: "MON",
        },
      },
    ],
  },
  ...(plan.features.length
    ? {
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `O que o plano ${plan.name} inclui`,
          itemListElement: plan.features.map((feature) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: feature },
          })),
        },
      }
    : {}),
});

export const plansSchema = (anchorOn = "/"): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `Planos ${SITE_NAME}`,
  itemListOrder: "https://schema.org/ItemListOrderAscending",
  numberOfItems: PLANS.length,
  itemListElement: PLANS.map((plan, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: planService(plan, anchorOn),
  })),
});

/**
 * Delivered work. Each entry is the live site, credited to us as its creator —
 * clients are not named anywhere on this site, so they are not named here
 * either and the sector stands in for the title.
 */
/**
 * A project's still. Every project has one, including the captured ten: a
 * video poster is the first frame of a scroll-through, which is the wrong
 * image to hand a social card or a crawler.
 */
export const projectImage = (project: Project): string =>
  `/assets/portfolio/project-${project.slug}-shot.webp`;

/**
 * The delivered work as a list. Takes the projects to describe so a filtered
 * `/projetos/setor/…` route advertises its own subset rather than the whole
 * body, which would tell a crawler the page holds rows it does not have.
 */
export const projectsSchema = (projects: Project[] = PROJECTS): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `Projetos entregues por ${SITE_NAME}`,
  numberOfItems: projects.length,
  itemListElement: projects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: abs(`/projetos/${project.slug}/`),
    item: {
      "@type": "WebSite",
      name: project.sector,
      description: project.description,
      ...(project.url ? { url: project.url } : {}),
      inLanguage: "pt-BR",
      creator: publisherRef,
      thumbnailUrl: abs(projectImage(project)),
    },
  })),
});

/**
 * One delivered site. `CreativeWork` with the studio as `creator` says what is
 * actually true — we made this — while `mainEntity` points at the live site so
 * the claim and its evidence are one node apart. The client is not named here
 * either: the page does not name them, and structured data that contradicted
 * the page would be the kind of mismatch a crawler is built to catch.
 */
export const projectSchema = (project: Project): JsonLd => ({
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "@id": abs(`/projetos/${project.slug}/#project`),
  name: `${project.sector} — site desenvolvido por ${SITE_NAME}`,
  description: project.description,
  url: abs(`/projetos/${project.slug}/`),
  image: abs(projectImage(project)),
  inLanguage: "pt-BR",
  creator: publisherRef,
  isPartOf: { "@id": WEBSITE_ID },
  genre: project.sector,
  ...(project.url
    ? {
        mainEntity: {
          "@type": "WebSite",
          name: project.sector,
          url: project.url,
          inLanguage: "pt-BR",
          creator: publisherRef,
        },
      }
    : {}),
});

/**
 * The generic page node. `@type` varies by route (`WebPage`, `ContactPage`,
 * `CollectionPage`…) and the rest — who published it, what site it belongs to,
 * what language it is in — is the same everywhere, which is exactly what a
 * crawler needs repeated.
 */
export const pageSchema = (options: {
  type?: string;
  name: string;
  description: string;
  path: string;
  primaryImage?: string;
}): JsonLd => ({
  "@context": "https://schema.org",
  "@type": options.type ?? "WebPage",
  "@id": abs(`${options.path}#webpage`),
  url: abs(options.path),
  name: options.name,
  description: options.description,
  inLanguage: "pt-BR",
  isPartOf: { "@id": WEBSITE_ID },
  publisher: publisherRef,
  ...(options.primaryImage
    ? {
        primaryImageOfPage: {
          "@type": "ImageObject",
          url: abs(options.primaryImage),
        },
      }
    : {}),
});
