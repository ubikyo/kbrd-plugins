/**
 * The two text treatments that can't be handed to the renderer as-is:
 * casing and script.
 *
 * Both exist in CSS (`text-transform`, `vertical-align`) and neither is
 * usable here. The device draws its labels through Kivy, which has no
 * equivalent for either — so a label that read one way in the app and
 * another on the hardware would be exactly the mistake the Composer is
 * there to prevent. Both are therefore resolved *before* anything is
 * drawn: the string is recased here, and the script is expressed as a
 * font size and a baseline offset that the web and Kivy renderers each
 * apply in their own units.
 *
 * `render-label/dev/renderer.py` is the other half of this file — the
 * same three rules in Python. The numbers below are the contract between
 * the two and have to be changed in both.
 */

/** How a label's own text is cased on the way to the renderer. */
export type TextTransform = "none" | "capitalize" | "uppercase" | "lowercase";

/** Whether a label rides above or below its own baseline. */
export type TextScript = "none" | "super" | "sub";

/**
 * A script's text is drawn at this fraction of the size the field says —
 * the usual typographic two-thirds, which keeps a superscript legible at
 * the sizes a keycap actually uses (a 8mm label comes out at 5.2mm).
 */
export const SCRIPT_SIZE_RATIO = 0.65;

/**
 * How far off the baseline each one sits, as a fraction of the *full*
 * size rather than the shrunken one — so raising a label doesn't also
 * shrink the distance it's raised by.
 *
 * A superscript's rise is larger than a subscript's drop, the way it is
 * in every typeface: a raised glyph has to clear the x-height, while a
 * dropped one only has to clear the baseline.
 */
export const SCRIPT_OFFSET_RATIO: Record<TextScript, number> = {
  none: 0,
  super: 0.33,
  sub: -0.16,
};

/**
 * The text as it should actually be drawn. `capitalize` follows CSS's own
 * rule — the first letter of every word, leaving the rest of each word
 * alone — rather than lowercasing what it doesn't touch, so a label
 * already written "USB Hub" isn't quietly rewritten to "Usb Hub".
 */
export function transformText(text: string, transform: TextTransform): string {
  switch (transform) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "capitalize":
      // Every run of non-space, first character up and the rest left
      // alone — which is also exactly what `transform_text` does in
      // `render-label/dev/renderer.py`. Matching runs rather than letters
      // is what keeps the two in step on a word that doesn't start with
      // one: "1st" comes back "1st" from both, not "1St".
      return text.replace(/\S+/g, (word) =>
        word.charAt(0).toUpperCase().concat(word.slice(1)),
      );
    default:
      return text;
  }
}

/** The size a script's text is drawn at, given the size the field says. */
export const scriptFontSize = (size: number, script: TextScript) =>
  script === "none" ? size : size * SCRIPT_SIZE_RATIO;

/**
 * How far the text moves off its own baseline, in the same unit as
 * `size`. Positive is *up* — each renderer turns that into whichever
 * direction its own axis runs (SVG's y grows downwards, Kivy's upwards).
 */
export const scriptOffset = (size: number, script: TextScript) =>
  size * SCRIPT_OFFSET_RATIO[script];
