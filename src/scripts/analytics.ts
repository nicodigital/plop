/**
 * Provider-agnostic event bus. Components dispatch names, never vendor ids,
 * so GA4/GTM/Meta can be attached later without touching a component.
 */
export type PlopEvent =
  | "cta_primary_click"
  | "plans_view"
  | "plan_select"
  | "whatsapp_click"
  | "contact_submit"
  | "project_view"
  | "blog_cta_click";

type Payload = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plopTrack?: (event: PlopEvent, payload?: Payload) => void;
    dataLayer?: unknown[];
  }
}

export const track = (event: PlopEvent, payload: Payload = {}): void => {
  window.plopTrack?.(event, payload);
  window.dataLayer?.push({ event, ...payload });
};

/** Wires declarative `data-track` attributes and the form's success event. */
export const initAnalytics = (): void => {
  document.addEventListener("click", (nativeEvent) => {
    const target = (nativeEvent.target as HTMLElement | null)?.closest<HTMLElement>(
      "[data-track]",
    );
    if (!target) return;
    const name = target.dataset.track as PlopEvent | undefined;
    if (!name) return;
    track(name, target.dataset.trackValue ? { value: target.dataset.trackValue } : {});
  });

  window.addEventListener("plop:contact_submit", () => track("contact_submit"));

  const plans = document.querySelector("[data-plans-section]");
  if (plans) {
    const seen = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          track("plans_view");
          seen.disconnect();
        });
      },
      { threshold: 0.4 },
    );
    seen.observe(plans);
  }
};
