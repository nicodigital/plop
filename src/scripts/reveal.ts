/**
 * One reveal, shared by the whole page. Content is visible by default and
 * the observer only adds the finished state, so a failed script never hides
 * anything. The reveal runs for everyone: the site's answer to
 * prefers-reduced-motion was removed deliberately by the owner.
 */
export const initReveal = (): void => {
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
  if (targets.length === 0) return;

  // The head flag armed the hidden state; if the observer is unavailable,
  // disarm it rather than leaving content hidden.
  if (!("IntersectionObserver" in window)) {
    document.documentElement.classList.remove("js-reveal");
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.15 },
  );

  targets.forEach((el) => observer.observe(el));
};
