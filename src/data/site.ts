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
 * Registered address. Kept here rather than typed into the footer because two
 * consumers read it: the visible line at the end of the page and the
 * `PostalAddress` node inside `organizationSchema()`. A local result is only
 * as good as the agreement between those two — a crawler that finds one
 * locality in the markup and another in the JSON-LD trusts neither.
 *
 * No street line: clients are served remotely and never visit, so publishing
 * the door number is exposure without a local-search return. City, state and
 * postcode are all a `LocalBusiness` needs to stay eligible.
 *
 * `postalCode` carries the plain digits form the Correios use; `postalDisplay`
 * is the dotted form the footer shows.
 */
export const ADDRESS = {
  postalCode: "80240-030",
  postalDisplay: "80.240-030",
  city: "Curitiba",
  region: "PR",
  regionName: "Paraná",
  country: "Brasil",
  countryCode: "BR",
} as const;

/** The address on one line, as the footer prints it. */
export const ADDRESS_LINE = `${ADDRESS.city} — ${ADDRESS.regionName}, ${ADDRESS.country}. CEP ${ADDRESS.postalDisplay}`;

