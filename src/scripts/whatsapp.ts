/**
 * Every WhatsApp link renders as the universal `wa.me` URL, so the CTA works
 * with no JS and hands straight off to the app on a phone. On a desktop that
 * URL costs an extra click on WhatsApp's "continue to chat" interstitial, so
 * links carrying `data-whatsapp-web` are upgraded to WhatsApp Web here.
 */

/**
 * A phone is whatever the UA claims is mobile. Browsers without
 * `userAgentData` fall back to the UA string plus a touch-primary, no-hover
 * media query — the `hover: none` half matters, because without it a Windows
 * laptop with a touchscreen would be read as a phone.
 */
const isMobileDevice = (): boolean => {
  const uaData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } })
    .userAgentData;
  if (typeof uaData?.mobile === "boolean") return uaData.mobile;

  return (
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
    window.matchMedia("(pointer: coarse) and (hover: none)").matches
  );
};

export const initWhatsAppLinks = (): void => {
  if (isMobileDevice()) return;

  document
    .querySelectorAll<HTMLAnchorElement>("a[data-whatsapp-web]")
    .forEach((link) => {
      const webHref = link.dataset.whatsappWeb;
      if (webHref) link.href = webHref;
    });
};
