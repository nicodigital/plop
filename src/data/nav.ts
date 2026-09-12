export type NavItem = {
  label: string;
  href: string;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Início", href: "/" },
  { label: "Planos", href: "/planos/" },
  { label: "Projetos", href: "/projetos/" },
  { label: "Blog", href: "/blog/" },
  { label: "Contato", href: "/contato/" },
];

export const PRIMARY_CTA = { label: "Quero meu site", href: "/contato/" } as const;
