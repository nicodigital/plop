# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro + TypeScript + Tailwind CSS 4 (official Vite plugin) + Swiper, deployed as static output to Cloudflare Workers Static Assets. Decided by the user in `CLAUDE.md`, not delegated. No client framework (React/Vue/Svelte) and no GSAP.

## Users

Primary: owners and managers of small Brazilian businesses — local commerce, services, independent professionals — who need a professional web presence and have neither an in-house team nor the budget or patience for an agency process. They arrive skeptical about price and about how much work a website will demand of them afterwards.

Secondary: Brazilian real-estate agencies and brokers (`imobiliárias`, `corretores`), addressed later through dedicated vertical/SEO pages rather than on the home page of the first version.

The buyer is usually the owner personally. They evaluate on a phone, between other tasks, and decide fast on evidence of quality plus a price they can hold in their head.

## Product Purpose

PLOP! Sites builds, publishes and then maintains websites for small businesses. The site sells the outcome — presence, speed, visibility, ongoing care, simplicity — not the technology stack.

Success for the site is a qualified contact: a filled contact form or a started WhatsApp conversation, from someone who already understands what the product is and what it costs.

## Positioning

A finished site plus continuous monthly care at a price a small business can plan around: an entry payment and a monthly fee that covers hosting, technical support, maintenance and one published piece of content per month. Neither a one-off freelance delivery that leaves the client alone afterwards, nor an agency retainer.

Brand idea: *sites que hacen acontecer*. Positioning line: high performance without high cost or unnecessary complexity.

Promise that must hold in the product and in the site itself: **Menos complexidade. Mais performance.**

## Operating Context

- Public copy is Brazilian Portuguese. Code, component names, comments and technical docs are English.
- URLs are in Portuguese and stable.
- MVP information architecture: `/` home, `/planos/`, `/projetos/` (or `/portfolio/`), `/blog/`, `/blog/[slug]/`, `/contato/`, plus required legal pages.
- Architecture must be ready to grow into intent/vertical pages (`/sites-para-pequenos-negocios/`, `/sites-para-imobiliarias/`, `/sites-para-restaurantes/`, `/sites-para-clinicas/`) without restructuring. No doorway pages and no duplicated local content.
- Blog content is file-based, managed by PLOP, not by the client.

## Capabilities and Constraints

- Commercial offer is three plans. The middle one is the recommended plan and the only one confirmed by the original spec:

  | Plan | For whom | Entry | Monthly |
  |---|---|---|---|
  | Essencial | one-page landing | R$ 900 | R$ 200/mês |
  | Profissional *(recommended)* | one page + blog | R$ 1.500 | R$ 300/mês |
  | Completo | multi-page site + blog | from R$ 3.000 | R$ 450/mês |

  **Essencial and Completo prices are provisional**, proposed by the agent and accepted as a working structure; they are not yet commercially confirmed. Profissional (R$ 1.500 + R$ 300/mês) comes from the spec and is firm.

- The monthly fee may include hosting, technical support, maintenance, and publication of one piece of content per month. It must not be described as including full SEO copywriting unless that is explicitly decided.

- Conversion mechanics, as decided by the user:
  - a contact form lives in the footer, present across the site;
  - a fixed WhatsApp affordance sits at the bottom-right of the viewport;
  - `/contato/` holds the full form.
  Form handling requires server-side validation and spam protection; the endpoint can be a Cloudflare Worker. Tracking fires only after a confirmed successful submission.

- Provider-agnostic analytics events to support: `cta_primary_click`, `plans_view`, `plan_select`, `whatsapp_click`, `contact_submit`, `project_view`, `blog_cta_click`.

- Performance is an acceptance criterion, not an aspiration: LCP ≤ 2.5s, CLS ≤ 0.1, INP ≤ 200ms on mobile in real conditions.

- **Deprecated:** the scroll-driven laptop frame-sequence storytelling in `SPEC.md` §6 and `DESIGN.md` §13. It is replaced by a hero background video plus a Swiper project slider. No canvas frame scrubbing, no GSAP, no image-sequence playback.

## Brand Commitments

- Name: **PLOP! Sites**. The `Sites` in the name is descriptive and deliberate.
- Logo: the approved vector at `assets/img/logo.svg`. Never rebuilt with a font, never recolored, never given 3D effects or shadows.
- Voice: direct, close, concrete Brazilian Portuguese. Banned register: `experiências digitais disruptivas`, `soluções 360º`, `transformação digital inovadora`. Aligned vocabulary: simples, rápido, resultado, negócio, crescer, presença, cuidado, suporte, performance.
- Confirmed copy anchors: `Seu negócio em destaque.` (H1), `Sites modernos, rápidos e fáceis de gerenciar.`, `Seu site pronto. E cuidado todos os meses.`, `Você cuida do seu negócio. A gente cuida do seu site.`, CTAs `Quero meu site` / `Ver planos`.
- Personality: direct, memorable, optimistic, accessible, technical without corporate-tech coldness, fun without being childish. Explicitly not: cyberpunk, heavy glassmorphism, dark neon, gamer, rainbow gradients, AI-cliché imagery.

## Evidence on Hand

Real delivered client websites, captured as scroll-through videos at `assets/portfolio/` — 11 files, 10 distinct projects, all 956×472 (≈2:1, browser-window proportion), 30fps, 12–38s, WebM:

`ADIUM` (pharma product), `ALOHAUS` (architecture), `BERCETCHE` (architecture), `BUENAVENTURA` (film production), `JEYDI` (design studio), `MOVIRUTA` (electric mobility), `NOMIA` + `NOMIA-2` (cybersecurity consulting), `PETCREMATION` (pet services), `SILENTROOM` (audio/interiors), `VETCROSS` (veterinary).

**Presentation constraint, decided by the user:** these projects are shown **by sector only, without client names** — e.g. `Arquitetura`, `Cibersegurança`, `Produção audiovisual`. No client name, no logo, no link to the live site unless permission is later confirmed. The work is Spanish-language (Uruguay/LatAm); the sites shown must not be captioned in a way that implies Brazilian clients.

Hero asset: `assets/video/bg-hero.mp4` — floating laptop on the blue/liquid PLOP environment. A frame sequence also exists at `assets/sequence/` but belongs to the deprecated concept.

**Must not be fabricated:** client names, testimonials, ratings, project results or metrics, client counts, years in business, locations, or awards. None are confirmed and none exist on hand.

## Product Principles

1. **Commercial clarity before technical display.** A visitor understands what PLOP does and what it costs within seconds, without scrolling into an explanation.
2. **The price is the argument.** The offer is legible, whole, and never hidden behind "consulte-nos". Three plans, one recommended.
3. **Proof is the portfolio, not adjectives.** Quality is demonstrated by showing real work large and in motion, since names and metrics cannot be claimed.
4. **Performance is part of the product.** A site that sells speed must be fast; a visually impressive site that performs badly is a product failure, not a trade-off.
5. **The content survives the enhancement.** Every critical message, CTA and proof exists as real HTML that works without video, without JavaScript, and with reduced motion on.

## Accessibility & Inclusion

Target WCAG 2.2 AA. Binding for this product: real semantic HTML for all critical content; no essential information carried only by video, color or motion; visible focus; full keyboard operation including the Swiper slider; touch targets ≥ 44×44px; accessible form labels and error messages; `prefers-reduced-motion` respected by the hero video and every transition. Decorative video stays out of the accessibility tree.
