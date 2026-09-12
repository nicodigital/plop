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

  wireAnchors(lenis);
}

/**
 * In-page links have to be handled explicitly: while Lenis holds the scroll
 * position, the browser's own jump to a fragment gets overwritten on the next
 * frame. Focus moves either way, so the keyboard lands where the eye does.
 */
function wireAnchors(instance: Lenis | null): void {
  document.addEventListener("click", (event) => {
    const link = (event.target as Element | null)?.closest?.<HTMLAnchorElement>(
      'a[href^="#"]',
    );
    if (!link || link.hash.length <= 1) return;

    const target = document.querySelector<HTMLElement>(link.hash);
    if (!target) return;

    event.preventDefault();

    // The skip link is navigation, not decoration: easing it would make the
    // one control that exists to save time cost a second.
    const immediate = link.matches(".sr-only, [data-scroll-immediate]");

    if (instance) {
      instance.scrollTo(target, { immediate, offset: 0 });
    } else {
      target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
    }

    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    history.replaceState(null, "", link.hash);
  });
}
