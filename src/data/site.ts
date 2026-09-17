/**
 * Canonical origin. Confirm before the first production deploy: the sitemap,
 * canonicals and Open Graph URLs are all built from this value.
 */
import { entryPrice, formatBRL } from "./plans.ts";

export const SITE_URL = "https://plopsites.com.br";

export const SITE_NAME = "Plop! sites";

/**
 * The one-line description of the business. Used as the blockquote in
 * `llms.txt`, as the Organization description and as the fallback for any
 * surface that needs the offer in a sentence.
 *
 * The entry price is read from `plans.ts` rather than typed: this string used
 * to quote a figure the plan cards had already moved past.
 */
export const SITE_DESCRIPTION = `Sites modernos, rápidos e fáceis de gerenciar. Entrada a partir de ${formatBRL(entryPrice())} e mensalidade com hospedagem, suporte e manutenção incluídos.`;

/**
 * Default social card. Root-relative; `BaseLayout` resolves it against
 * `SITE_URL`. 1200×630 JPEG because WhatsApp and several clients will not
 * preview a WebP — `scripts/og-image.mjs` produces it.
 */
export const OG_IMAGE = "/assets/og/plop-og.jpg";
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const OG_IMAGE_ALT =
  "PLOP! Sites — sites modernos, rápidos e fáceis de gerenciar.";

/**
 * Real business number in international format, digits only.
 * While this is empty the WhatsApp affordances point at the contact form
 * instead: a wa.me link to a number that does not exist is a dead CTA that
 * looks live, which is worse than not offering the channel yet.
 */
export const WHATSAPP_NUMBER = "+5541999390088";

export const WHATSAPP_MESSAGE = "Oi! Quero saber mais sobre os sites do PLOP!";

export const HAS_WHATSAPP = WHATSAPP_NUMBER.length > 0;

export const whatsappHref = (message: string = WHATSAPP_MESSAGE): string =>
  HAS_WHATSAPP
    ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    : "/#contato";

export const CONTACT_EMAIL = "ola@plopsites.com.br";

/**
 * The Google Business Profile, addressed by its CID — the listing's stable id.
 * A Maps URL copied out of the address bar carries a session build stamp and a
 * UI language and stops resolving; this form does not. The CID also keeps the
 * link pointing at the profile rather than at a pin on a street, which is what
 * a service-area business wants.
 */
export const GOOGLE_BUSINESS_PROFILE =
  "https://maps.google.com/?cid=10583425524771451781";

/** Same number as WhatsApp, formatted for display and for a `tel:` href. */
export const PHONE_NUMBER = WHATSAPP_NUMBER;

export const PHONE_DISPLAY = "+55 (41) 99939-0088";

/**
 * Where the business is, at the only resolution it is published: city, state
 * and country. Kept here rather than typed into the footer because two
 * consumers read it — the visible line at the end of the page and the
 * `PostalAddress` node inside `organizationSchema()` — and a crawler that
 * finds one locality in the markup and another in the JSON-LD trusts neither.
 *
 * No street and no postcode. Clients are served remotely and never visit, so
 * the Business Profile runs as a service-area listing with its address hidden,
 * and Google asks that the site not publish what the profile withholds. A
 * `PostalAddress` needs neither field to keep `LocalBusiness` eligible.
 */
/**
 * What the studio does and where, in one line of prose.
 *
 * The Business Profile is a service-area listing, and Google corroborates a
 * listing by reading the site. Until this existed the city lived only inside
 * the JSON-LD and the footer address — retrieval runs over text, so neither
 * was reachable. It is a plain visible line in the footer, never hidden
 * markup: text served to a crawler and withheld from a reader is what a
 * manual action is for.
 *
 * "Atendimento em todo o Brasil" is not padding — it is the honest half. The
 * work is remote and the listing declares a service area, so a line naming
 * only the city would describe a storefront that does not exist.
 */
export const LOCAL_SUMMARY =
  "Desenvolvimento web de Curitiba para todo o Brasil.";

/**
 * The cities the Google Business Profile declares as its service areas.
 *
 * Kept in sync with the listing on purpose. The profile runs with its address
 * hidden, so these areas are the only statement of reach Google holds for it —
 * and `organizationSchema()` repeats them so the site corroborates the listing
 * instead of describing a different business.
 *
 * Curitiba first, then its metropolitan neighbours, then São Paulo. The order
 * is the order of proximity, which is also the order in which a local result is
 * winnable: the pack weighs distance heavily, so the municipalities next door
 * are reachable long before a different state's capital is.
 *
 * The profile and this list have to say the same thing. Change the profile
 * first; a list that runs ahead of it publishes a reach Google cannot confirm.
 * (Google accepts up to 20 areas, so there is room — but each one should be
 * somewhere the work is genuinely delivered.)
 */
export const SERVICE_AREA_CITIES = [
  "Curitiba",
  "São José dos Pinhais",
  "Pinhais",
  "Colombo",
  "Araucária",
  "São Paulo",
] as const;

export const ADDRESS = {
  city: "Curitiba",
  region: "PR",
  regionName: "Paraná",
  country: "Brasil",
  countryCode: "BR",
} as const;


