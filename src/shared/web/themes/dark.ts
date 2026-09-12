import type { KbrdPalette } from "./palette";

/**
 * The app's original look, and still its default one: pure black
 * everywhere, chrome drawn in greys a step or two off it, and white kept
 * for the one thing on screen that's being pointed at.
 *
 * Every value here was already somewhere in the app before there were
 * themes at all — this file only gave them names.
 */
export const darkPalette: KbrdPalette = {
  "--kbrd-color-body": "#000000",
  "--kbrd-color-surface": "#222120",
  "--kbrd-color-raised": "#1F1F1F",
  "--kbrd-color-hover": "#171717",
  "--kbrd-color-active": "#2E2E2E",
  "--kbrd-border-color": "#333333",
  "--kbrd-rule-color": "#1E1E1E",
  "--kbrd-border-alt": "#FFFFFF",
  "--kbrd-color-contrast": "#FFFFFF",
  "--kbrd-color-text": "#C9C9C9",
  "--kbrd-color-selected": "#00FF00",
  // The same warm grey as `--kbrd-color-surface` here — it's in the light
  // theme that the casing has to part company with it. See the role's own
  // docblock.
  "--kbrd-display-case": "#222120",
};
