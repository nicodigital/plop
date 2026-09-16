/**
 * Sector filter for the projects table.
 *
 * The whole table is in the DOM already, so filtering is only a matter of
 * setting `hidden` on the rows that do not match. The reason it is worth any
 * JavaScript at all is the transition: each row is given a unique
 * `view-transition-name` immediately before the swap, which is what lets the
 * browser animate the surviving rows into their new positions rather than
 * blinking the list from one state to the next.
 *
 * The names are assigned by index over the full row list, so a given row keeps
 * the same name across a swap — that identity is what the browser matches on.
 * They are cleared afterwards: a permanent name on thirty-three rows would
 * make every later transition on the page capture all of them.
 */

import { scrollToSection } from "./smooth-scroll.ts";

/** The section the filter controls, which the click travels to. */
const TABLE_ID = "trabalhos-table";

type Elements = {
  table: HTMLElement;
  rows: HTMLElement[];
  controls: HTMLElement[];
  empty: HTMLElement | null;
};

/**
 * Carry the visitor to the table they just narrowed.
 *
 * Deliberately *after* the transition rather than alongside it: a view
 * transition paints its snapshots fixed to the viewport, so a page scrolling
 * underneath one leaves the old list hanging on screen while everything else
 * moves. Waiting costs 380ms, which is shorter than the scroll itself.
 */
const travelToTable = (): void => {
  const target = document.getElementById(TABLE_ID);
  if (target) scrollToSection(target);
};

const read = (): Elements | null => {
  const table = document.querySelector<HTMLElement>("[data-projects-table]");
  if (!table) return null;

  return {
    table,
    rows: Array.from(table.querySelectorAll<HTMLElement>("[data-sector-group]")),
    controls: Array.from(
      document.querySelectorAll<HTMLElement>("[data-sector-filter]"),
    ),
    empty: document.querySelector<HTMLElement>(".projects-table__empty"),
  };
};

/** Show the rows in `group`, or every row when it is `*`. */
const applyFilter = (elements: Elements, group: string): void => {
  let shown = 0;

  for (const row of elements.rows) {
    const match = group === "*" || row.dataset.sectorGroup === group;
    row.hidden = !match;
    if (match) shown += 1;
  }

  /* `aria-pressed` rather than a class alone: the active state has to reach a
     screen reader, not only the stylesheet. */
  for (const control of elements.controls) {
    const value = control.dataset.sectorFilter;
    if (!value) continue;
    /* The empty state's reset shares the data attribute but is not part of
       the group, so it never claims to be the pressed one. */
    if (control.hasAttribute("aria-pressed")) {
      control.setAttribute("aria-pressed", String(value === group));
    }
  }

  if (elements.empty) elements.empty.hidden = shown > 0;
};

/**
 * One transition name per row, cleared as soon as the browser has finished
 * with them. Assigning by index keeps a row's name stable across the swap.
 */
const withNames = (rows: HTMLElement[], swap: () => void): Promise<void> => {
  rows.forEach((row, index) => {
    row.style.viewTransitionName = `project-row-${index}`;
  });

  const clear = () => {
    for (const row of rows) row.style.removeProperty("view-transition-name");
  };

  const transition = document.startViewTransition(swap);
  return transition.finished.then(clear, clear);
};

export const initProjectsFilter = (): void => {
  const elements = read();
  if (!elements) return;

  let current = "*";

  const select = (group: string) => {
    /* Re-picking the sector already showing is not a state change, but it is
       still a click asking to see the table — so it travels without paying
       for a transition that would swap the list for itself. */
    if (group === current) {
      travelToTable();
      return;
    }

    current = group;

    const swap = () => applyFilter(elements, group);

    /* Reduced motion is not handled here. It used to be, and that was the
       wrong call twice over: it made the whole effect invisible to anyone
       with the setting on rather than merely calmer, and it put the decision
       somewhere a stylesheet could not see. The transition still starts; the
       reduced-motion block in `global.css` strips the travel out of it and
       leaves a plain cross-fade, which is the accepted treatment — what the
       setting asks to remove is movement, not feedback. */
    if (!document.startViewTransition) {
      swap();
      travelToTable();
      return;
    }

    void withNames(elements.rows, swap).then(travelToTable);
  };

  /* Bound per control rather than on `document`: this page adds one listener
     for each of the seven, and none of them outlives the document. */
  for (const control of elements.controls) {
    const group = control.dataset.sectorFilter;
    if (!group) continue;
    control.addEventListener("click", () => select(group));
  }
};
