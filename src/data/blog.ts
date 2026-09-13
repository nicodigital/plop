/**
 * Blog vocabulary and sizing. The posts themselves live in the `blog` content
 * collection; this module holds the things the collection references (category
 * keys) and the things the pages agree on (how many posts a surface shows).
 */
import { SITE_NAME } from "./site.ts";

/** Category keys. The collection schema validates frontmatter against these. */
export const BLOG_CATEGORY_KEYS = [
  "performance",
  "negocio",
  "conteudo",
  "curitiba",
] as const;

export type BlogCategoryKey = (typeof BLOG_CATEGORY_KEYS)[number];

/** Label shown on the card badge and on the article pill. */
export const BLOG_CATEGORIES: Record<BlogCategoryKey, string> = {
  performance: "Performance",
  negocio: "Negócio",
  conteudo: "Conteúdo",
  curitiba: "Curitiba",
};

/**
 * Listing page size. Three full card rows on the three-column grid, so a page
 * ends on a complete row at every breakpoint (9 divides by 3, 2 leaves one
 * card alone on the tablet layout — that is the tradeoff of this number).
 */
export const POSTS_PER_PAGE = 9;

/** Teaser count on the home page. Matches the listing's row of three. */
export const POSTS_ON_HOME = 3;

/** Posts are published by the studio, not by a named person. */
export const BLOG_AUTHOR = SITE_NAME;

/**
 * Post dates are authored as bare `YYYY-MM-DD`, which parses as UTC midnight.
 * Formatting that in a timezone behind UTC — every Brazilian one — renders the
 * day before, so the formatters read the date back in UTC too.
 */
const DATE_FORMATS = {
  long: new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }),
  short: new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }),
};

export const formatPostDate = (
  date: Date,
  length: keyof typeof DATE_FORMATS = "long",
): string => DATE_FORMATS[length].format(date);
