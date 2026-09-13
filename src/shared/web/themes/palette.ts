/**
 * The set of CSS custom properties every KBRD theme has to define, and
 * what each one means.
 *
 * A theme is nothing but one value per name below — `dark.ts` and
 * `light.ts` are the two that exist, and the type is what keeps them in
 * step: adding a role here breaks both until each has answered for it,
 * which is the point. Nothing else in the app is allowed a colour of its
 * own; a component that needs one names a role from this list.
 *
 * That includes what's drawn inside `<Display>`. The simulated screen is
 * the app's own ground like any other panel — its glass takes
 * `--kbrd-color-body`, its grid chrome the same borders the Inspector
 * uses — so the whole preview turns over with the theme. The single
 * exception is `--kbrd-display-case`, at the bottom of this list, and its
 * own docblock says why.
 */
export type KbrdPalette = {
  /** The app's own ground: every panel, modal, menu and input sits on it — and the display's glass. */
  "--kbrd-color-body": string;
  /** A patch raised off the ground — a `Kbd` cap, a property group's header. */
  "--kbrd-color-surface": string;
  /** A panel's own furniture, set back from the ground: the side tabs. */
  "--kbrd-color-raised": string;
  /** A row under the pointer. The quietest step off the ground there is. */
  "--kbrd-color-hover": string;
  /**
   * A tray sunk *into* the ground rather than raised off it: the setup
   * wizard's strip of steps, which holds the step being answered the way
   * a segmented control holds its segment. The only role that is darker
   * than the ground under the dark theme and darker than it under the
   * light one too — every other step in this list goes the other way.
   */
  "--kbrd-color-sunken": string;
  /** A tile being dropped on, or a button whose whole box lights up. */
  "--kbrd-color-active": string;
  /**
   * Anything drawn as a box in its own right: panel edges, modal borders,
   * inputs — and, on the glass, a cell's own chrome outline.
   */
  "--kbrd-border-color": string;
  /**
   * What a list is ruled with inside a panel: the grid the Media library
   * is laid out on, the rules between the Inspector's plugin rows, the
   * line under each property group's header. Well under the border
   * above, which at that density reads as a cage around every row rather
   * than as lines between them.
   */
  "--kbrd-rule-color": string;
  /**
   * The loud line — an opened accordion's underline, a cell's own label
   * and the outline a drop target goes. Nothing quieter than that.
   */
  "--kbrd-border-alt": string;
  /** The loudest foreground: an active tab's label, a Splitter thumb, a resize grip. */
  "--kbrd-color-contrast": string;
  /** Body text, everywhere no component states its own. */
  "--kbrd-color-text": string;
  /**
   * What "this is the one" is drawn in: a selected cell's outline in
   * `<Display>`, the drop mark a reordered property lands on, the
   * selected display's own casing.
   */
  "--kbrd-color-selected": string;

  /**
   * The band of material around the simulated screen — see
   * `.factory-display-case` in `App.css`.
   *
   * The one colour in the app that isn't shared with anything else, and
   * the only survivor of a `--kbrd-display-*` set that used to shadow
   * every role above (back when the screen stayed dark in both themes).
   * It earns its own name because of what it has to do: the band sits
   * between the app's ground behind it and the glass inside it, both of
   * which are `--kbrd-color-body`, and the step down to the glass is the
   * panel's own edge — there is no border drawing it. So the casing has
   * to read against `--kbrd-color-body` from both sides, and no other
   * role in the palette is a big enough step away from it in *both*
   * themes to do that (`--kbrd-color-surface`, the obvious candidate,
   * is only 5% off white in the light one).
   */
  "--kbrd-display-case": string;
};
