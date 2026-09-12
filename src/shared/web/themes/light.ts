import type { KbrdPalette } from "./palette";

/**
 * The same app on paper. Role for role with `dark.ts` — nothing is
 * dropped or added, each value is simply the one that says the same
 * thing against a white page instead of a black one.
 *
 * Two things aren't just an inversion:
 *
 *  - The greys keep the warm cast the dark theme's surface has
 *    (`#222120`), so the chrome reads as the same material lit
 *    differently rather than as a second, cooler design.
 *
 *  - The selection green goes from `#00FF00` to a deep `#008A1E`. Pure
 *    green is the one colour in the palette that simply doesn't survive
 *    the swap: it reads loud on black and all but disappears on white.
 *
 * The display turns over with everything else — its glass is
 * `--kbrd-color-body` like any other panel, so a light theme means a
 * white screen and dark grid chrome on it. Worth knowing what that
 * costs: the device itself draws on black, and so do the plugin defaults
 * (a label's `#ffffff`, a rectangle's fill), so artwork left at those
 * defaults is white-on-white here and effectively invisible. The
 * preview is the app's, not the hardware's, in this theme.
 */
export const lightPalette: KbrdPalette = {
  "--kbrd-color-body": "#FFFFFF",
  "--kbrd-color-surface": "#F2F1EF",
  "--kbrd-color-raised": "#EDECE9",
  "--kbrd-color-hover": "#F4F3F1",
  "--kbrd-color-active": "#DEDCD8",
  "--kbrd-border-color": "#C4C2BE",
  "--kbrd-rule-color": "#E6E4E0",
  "--kbrd-border-alt": "#1A1A1A",
  "--kbrd-color-contrast": "#000000",
  "--kbrd-color-text": "#3C3A38",
  "--kbrd-color-selected": "#008A1E",
  // Darker than `--kbrd-color-surface`, which at 5% off white would leave
  // the band barely there and the glass's own edge — the step from the
  // casing down to it — with nothing to be a step *from*. See the role's
  // own docblock.
  "--kbrd-display-case": "#E2E0DB",
};
