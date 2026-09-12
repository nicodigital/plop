import Lenis from "lenis";

/**
 * Smooth scrolling, kept deliberately short of scroll hijacking: Lenis only
 * eases the distance the visitor already asked for, it never takes the wheel
 * to drive a sequence. The page still scrolls natively on touch and whenever
 * this module fails to load.
 *
 * It used to stand down for prefers-reduced-motion. It no longer does — that
 * is the owner's call and it was made. The short duration below is what keeps
 * it defensible: the easing tail is what disorients, not the easing.
 */

let lenis: Lenis | null = null;

/** Exposed so other modules can pause the scroll (a modal, a locked drawer). */
export const getLenis = () => lenis;

export function initSmoothScroll(): void {
  lenis = new Lenis({
    // A single, moderate ease. Longer than this and the page starts to feel
    // like it is deciding when the visitor has arrived.
    duration: 0.9,
    easing: (t: number) => 1 - Math.pow(1 - t, 4),
    // Touch scrolls natively. Easing a finger that is already on the glass
    // adds latency to the one input that has none.
    syncTouch: false,
    touchMultiplier: 1,
    // Lenis stands down for prefers-reduced-motion on its own, which would
    // quietly undo the decision above and leave the scroll snapping while
    // everything else on the page animates.
    respectReducedMotion: false,
  });

  const frame = (time: number) => {
    lenis?.raf(time);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  wireAnchors();
  landOnInitialHash(lenis);
}

/**
 * Scroll to a section by id, the one way the whole site does it.
 *
 * Exported because the header drawer has to close before the travel starts:
 * a drawer left open over the page would hide the very section the link was
 * asking for.
 */
export function scrollToSection(
  target: HTMLElement,
  { immediate = false }: { immediate?: boolean } = {},
): void {
  if (lenis) {
    /**
     * The destination is measured here and handed over as a number, rather
     * than handing Lenis the element.
     *
     * Given an element, Lenis resolves it as `rect.top + animatedScroll` —
     * its own idea of where the page is. Any scroll it did not drive and has
     * not yet absorbed (a browser find-in-page, a `scrollIntoView` from
     * elsewhere on the page, a restored position) leaves that value stale for
     * a frame, and the anchor then lands short by exactly the drift. Measured
     * against `window.scrollY`, which is the scroll that is actually applied,
     * the sum is the element's absolute offset whatever Lenis believes.
     */
    lenis.scrollTo(target.getBoundingClientRect().top + window.scrollY, {
      immediate,
      offset: 0,
    });
  } else {
    target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }

  // Focus follows the eye, so a keyboard visitor carries on from the section
  // that just arrived rather than from the link they left behind.
  if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
}

/**
 * The hash a link is asking for, but only when it means "a section of the
 * page you are already on". The nav writes its links root-relative
 * (`/#planos`) so they also work from `/blog/`; on the home itself that is
 * still an in-page jump and must not reload the document.
 */
export function samePageHash(link: HTMLAnchorElement): string | null {
  if (!link.hash || link.hash.length <= 1) return null;
  if (link.target && link.target !== "_self") return null;
  if (link.origin !== window.location.origin) return null;
  // Astro serves with `trailingSlash: "always"`, so `/` and `/#x` agree here.
  if (link.pathname !== window.location.pathname) return null;
  return link.hash;
}

/**
 * In-page links have to be handled explicitly: while Lenis holds the scroll
 * position, the browser's own jump to a fragment gets overwritten on the next
 * frame.
 */
function wireAnchors(): void {
  document.addEventListener("click", (event) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
      "a[href]",
    );
    if (!link) return;

    const hash = samePageHash(link);
    if (!hash) return;

    const target = document.querySelector<HTMLElement>(hash);
    if (!target) return;

    event.preventDefault();

    // The skip link is navigation, not decoration: easing it would make the
    // one control that exists to save time cost a second.
    const immediate = link.matches(".sr-only, [data-scroll-immediate]");

    scrollToSection(target, { immediate });
    history.replaceState(null, "", hash);
  });
}

/**
 * Arriving from another page at `/#planos`, the browser jumps to the section
 * before Lenis exists and then Lenis restores the position it captured on the
 * frame it started. Re-issuing the jump through Lenis is what makes the two
 * agree; it is instant, because the visitor asked for the section, not for a
 * tour of everything above it.
 */
function landOnInitialHash(instance: Lenis | null): void {
  const hash = window.location.hash;
  if (!hash || hash.length <= 1) return;

  const target = document.querySelector<HTMLElement>(hash);
  if (!target) return;

  requestAnimationFrame(() => {
    instance?.resize();
    scrollToSection(target, { immediate: true });
  });
}
