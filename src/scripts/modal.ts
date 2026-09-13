import { getLenis } from "./smooth-scroll.ts";

/**
 * The whole modal system's JavaScript. It opens and closes native
 * `<dialog>` elements and nothing else: the focus trap, the inert page, the
 * top layer and Escape are the browser's, and the enter/exit motion is CSS.
 *
 * Delegated from the document, so a modal rendered anywhere on the page — or
 * a trigger inside content that arrives later — works without registration.
 *
 *   <button data-modal-open="blog-importa">…</button>
 *   <Modal id="blog-importa" title="…">…</Modal>
 */

let wired = false;

/** Dialogs currently in the top layer, so nested opens unlock only once. */
const openDialogs = new Set<HTMLDialogElement>();

/** Dialogs whose own listeners are already attached. */
const bound = new WeakSet<HTMLDialogElement>();

/** The control that opened each dialog, to hand focus back on close. */
const openers = new WeakMap<HTMLDialogElement, HTMLElement>();

/** Dialogs closing because the visitor left through a link inside them. */
const leaving = new WeakSet<HTMLDialogElement>();

export function initModals(): void {
  if (wired) return;
  wired = true;

  document.addEventListener("click", (event) => {
    const el = event.target as Element | null;

    const trigger = el?.closest?.<HTMLElement>("[data-modal-open]");
    if (trigger) {
      const dialog = document.getElementById(trigger.dataset.modalOpen!);
      if (dialog instanceof HTMLDialogElement) {
        event.preventDefault();
        openers.set(dialog, trigger);
        show(dialog);
      }
      return;
    }

    const closer = el?.closest?.<HTMLElement>("[data-modal-close]");
    if (closer) {
      event.preventDefault();
      closer.closest("dialog")?.close();
    }
  });
}

function show(dialog: HTMLDialogElement): void {
  if (dialog.open) return;

  bind(dialog);
  dialog.showModal();
  openDialogs.add(dialog);
  if (openDialogs.size === 1) lock();

  measure(dialog);
}

function bind(dialog: HTMLDialogElement): void {
  if (bound.has(dialog)) return;
  bound.add(dialog);

  /* A click that lands on the dialog itself landed on the empty space around
     the sheet — the panel is a child, so it never reports as the target.
     The press has to land outside too, or dragging a selection off the edge
     of the panel would close the thing the visitor is reading. */
  let pressedOutside = false;
  dialog.addEventListener("pointerdown", (event) => {
    pressedOutside = event.target === dialog;
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog && pressedOutside) dialog.close();
  });

  /* A link inside the sheet points somewhere the sheet is covering, so the
     sheet has to go. Bound on the dialog rather than on the document, which
     is what puts it ahead of the smooth-scroll handler: the page is closed
     and unfrozen by the time that one starts the travel. The click is left
     alone, so the link still does what it says. */
  dialog.addEventListener("click", (event) => {
    if ((event.target as Element | null)?.closest?.("a[href]")) {
      leaving.add(dialog);
      dialog.close();
    }
  });

  // Fires for Escape and for the form-method close as well as for ours, so
  // the unlock is here rather than next to each caller.
  dialog.addEventListener("close", () => {
    openDialogs.delete(dialog);
    if (!openDialogs.size) unlock();

    // Not when a link is taking the visitor somewhere: returning focus to the
    // opener would drag the page back to this section for a frame, and the
    // destination is about to claim focus anyway.
    if (!leaving.delete(dialog)) openers.get(dialog)?.focus();
    openers.delete(dialog);
  });

  const body = dialog.querySelector<HTMLElement>("[data-modal-scroll]");
  const panel = dialog.querySelector<HTMLElement>(".modal__panel");
  if (!body || !panel) return;

  // The head's hairline is the cut line: it only exists once the copy has
  // actually moved under it.
  body.addEventListener(
    "scroll",
    () => {
      panel.toggleAttribute("data-scrolled", body.scrollTop > 2);
    },
    { passive: true },
  );
}

/**
 * What can only be known once the dialog is in the top layer and laid out:
 * whether its body overflows. A scrollable region has to be reachable by
 * keyboard or the arrow keys have nothing to scroll; one that fits has no
 * reason to be a tab stop.
 */
function measure(dialog: HTMLDialogElement): void {
  const body = dialog.querySelector<HTMLElement>("[data-modal-scroll]");
  const panel = dialog.querySelector<HTMLElement>(".modal__panel");
  if (!body || !panel) return;

  if (body.scrollHeight > body.clientHeight + 1) body.setAttribute("tabindex", "0");
  else body.removeAttribute("tabindex");

  body.scrollTop = 0;
  panel.removeAttribute("data-scrolled");
}

function lock(): void {
  const gutter = window.innerWidth - document.documentElement.clientWidth;
  document.documentElement.style.setProperty("--modal-gutter", `${gutter}px`);
  document.documentElement.classList.add("has-modal");
  getLenis()?.stop();
}

function unlock(): void {
  getLenis()?.start();
  document.documentElement.classList.remove("has-modal");
  document.documentElement.style.removeProperty("--modal-gutter");
}
