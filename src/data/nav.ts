export type NavItem = {
  label: string;
  href: string;
  /** The section this item watches while the home page scrolls. */
  watches?: string;
};

/**
 * The site is a single page. Every item but the blog points at a section of
 * the home, written root-relative (`/#planos`) rather than bare (`#planos`)
 * so the same header works from `/blog/` — there the link navigates home and
 * then lands on the section, instead of hunting for an id that is not there.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/#topo", watches: "topo" },
  { label: "Planos", href: "/#planos", watches: "planos" },
  /* The only item that leaves the home for a page of its own: the slider on
     `/#projetos` shows ten, and this is where the other twenty live. */
  { label: "Projetos", href: "/projetos/" },
  { label: "Blog", href: "/blog/" },
  /* The second page of its own. It is here because a visitor deciding whether
     to trust a price looks for the person before the portfolio. */
  { label: "Sobre", href: "/sobre/" },
  { label: "Contato", href: "/#contato", watches: "contato" },
];

export const PRIMARY_CTA = { label: "Quero meu site", href: "/#contato" } as const;

/** Where the two recurring secondary actions point. */
export const PLANS_ANCHOR = "/#planos";
export const CONTACT_ANCHOR = "/#contato";
