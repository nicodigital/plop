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

/** Same number as WhatsApp, formatted for display and for a `tel:` href. */
export const PHONE_NUMBER = WHATSAPP_NUMBER;

export const PHONE_DISPLAY = "+55 (41) 99939-0088";
