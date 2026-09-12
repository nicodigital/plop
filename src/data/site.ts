/**
 * Canonical origin. Confirm before the first production deploy: the sitemap,
 * canonicals and Open Graph URLs are all built from this value.
 */
export const SITE_URL = "https://plopsites.com.br";

export const SITE_NAME = "PLOP! Sites";

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
    : "/contato/";

export const CONTACT_EMAIL = "ola@plopsites.com.br";

/** Same number as WhatsApp, formatted for display and for a `tel:` href. */
export const PHONE_NUMBER = WHATSAPP_NUMBER;

export const PHONE_DISPLAY = "+55 (41) 99939-0088";
