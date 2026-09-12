/**
 * A label's text, cut into the pieces that are emphasised differently.
 *
 * Bold, italic, underline, casing and script are the five treatments that
 * can be asked of *part* of a label rather than all of it: select the "r"
 * of "Jérôme", press U, and only that letter is underlined; select the
 * "2" of "H2O", press A₂, and only that one drops. Colour, font and size
 * stay whole-label — one label is one drawn string in both renderers, and
 * those three are what it is drawn *as*.
 *
 * The stored shape stays as close to what it was as it can. A label whose
 * emphasis is uniform — which is nearly all of them — carries exactly the
 * four flat fields it always did and no `spans` at all, so nothing about
 * an existing label changes and a renderer that has never heard of
 * `spans` still draws it correctly. `spans` appears only once a label
 * actually has two different treatments in it, and disappears again the
 * moment it doesn't.
 *
 * `render-label/dev/renderer.py` is the other half of this file: the same
 * resolution, in Python, for the device. Only the reading half is shared —
 * the editing below happens in the Composer alone.
 *
 * Everything here counts in *code points*, not UTF-16 code units, so that
 * an emoji is one position on both sides. The two `codePoint`/`codeUnit`
 * helpers are the border with the DOM, whose selection offsets are code
 * units.
 */

import type { TextScript, TextTransform } from "./typography";

/** The five treatments a piece of a label can carry on its own. */
export type Emphasis = {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  transform: TextTransform;
  script: TextScript;
};

export const EMPHASIS_KEYS = [
  "bold",
  "italic",
  "underline",
  "transform",
  "script",
] as const;

/**
 * One stored piece: how many characters it covers, and whichever of the
 * four it sets. A key left off falls back to the label's own flat field,
 * which is what lets a run that differs in one treatment alone say only
 * that.
 */
export type TextSpan = Partial<Emphasis> & { length: number };

/** A piece of a label with its text and all four treatments resolved. */
export type TextRun = Emphasis & { text: string };

/** The flat fields every label carries, whether or not it has spans. */
const emphasisOf = (source: Partial<Emphasis>, base: Emphasis): Emphasis => ({
  bold: source.bold ?? base.bold,
  italic: source.italic ?? base.italic,
  underline: source.underline ?? base.underline,
  transform: source.transform ?? base.transform,
  script: source.script ?? base.script,
});

const sameEmphasis = (a: Emphasis, b: Emphasis) =>
  EMPHASIS_KEYS.every((key) => a[key] === b[key]);

/**
 * Runs as they should be stored and drawn: no empty ones, and no two
 * neighbours saying the same thing. Both matter beyond tidiness — a
 * label whose runs collapse back into one is a label that goes back to
 * storing no `spans`, and that is what keeps `spans` from accumulating
 * on a label the user has undone their way out of.
 */
function normalise(runs: TextRun[]): TextRun[] {
  const merged: TextRun[] = [];
  for (const run of runs) {
    if (!run.text) continue;
    const last = merged[merged.length - 1];
    if (last && sameEmphasis(last, run)) last.text += run.text;
    else merged.push({ ...run });
  }
  return merged;
}

/** One entry per character, which is the form every edit below works in:
 * splitting and re-joining runs by index is where the off-by-ones live,
 * and a label is a handful of characters. */
const perCharacter = (runs: TextRun[]): Emphasis[] =>
  runs.flatMap((run) =>
    [...run.text].map(() => ({
      bold: run.bold,
      italic: run.italic,
      underline: run.underline,
      transform: run.transform,
      script: run.script,
    })),
  );

/** The inverse: characters and their treatments back into runs. */
function fromCharacters(characters: string[], attrs: Emphasis[]): TextRun[] {
  return normalise(
    characters.map((character, index) => ({
      ...attrs[index],
      text: character,
    })),
  );
}

/**
 * The pieces a label is actually made of, from what it stores. Spans that
 * run past the end of the text are clipped and text past the end of the
 * spans takes the label's flat fields, so a `spans` that has fallen out
 * of step with `text` degrades to the uniform label rather than losing
 * characters.
 */
export function resolveRuns(
  text: string,
  spans: TextSpan[] | undefined,
  base: Emphasis,
): TextRun[] {
  const characters = [...text];
  if (!Array.isArray(spans) || spans.length === 0) {
    return normalise([{ ...base, text }]);
  }

  const runs: TextRun[] = [];
  let at = 0;
  for (const span of spans) {
    if (at >= characters.length) break;
    const length = Math.max(0, Math.trunc(span?.length ?? 0));
    if (!length) continue;
    const slice = characters.slice(at, at + length);
    at += slice.length;
    runs.push({ ...emphasisOf(span, base), text: slice.join("") });
  }
  if (at < characters.length) {
    runs.push({ ...base, text: characters.slice(at).join("") });
  }
  return normalise(runs);
}

/**
 * What a label should store for these runs: the flat fields, and `spans`
 * only if the runs actually differ.
 *
 * The flat fields of a label that *does* have spans are the first run's.
 * They are what a reader who ignores `spans` draws the whole label with —
 * an older device, or `pluginSummary`-style code that only wants the
 * gist — so they have to be one of the label's real treatments rather
 * than a default; the opening one is the one such a reader is least
 * likely to find surprising.
 */
export function storedRuns(
  runs: TextRun[],
  fallback: Emphasis,
): Emphasis & { spans: TextSpan[] | undefined } {
  const pieces = normalise(runs);
  const base = pieces[0] ? emphasisOf(pieces[0], fallback) : fallback;
  return {
    ...base,
    spans:
      pieces.length > 1
        ? pieces.map((run) => ({
            length: [...run.text].length,
            bold: run.bold,
            italic: run.italic,
            underline: run.underline,
            transform: run.transform,
            script: run.script,
          }))
        : undefined,
  };
}

/**
 * The one script the whole label is in, or `null` if two pieces of it
 * disagree.
 *
 * Both renderers need this, and both branch on it the same way. A label
 * whose script is uniform — every label until now — is drawn exactly as
 * it was: the whole string set at the shrunken size and the whole line
 * moved off its baseline. Only a label that mixes them has to express
 * the script piece by piece, which is the harder and less exact path on
 * the device (see `markup_for` in `render-label/dev/renderer.py`).
 */
export function uniformScript(runs: TextRun[]): TextScript | null {
  if (runs.length === 0) return "none";
  const first = runs[0].script;
  return runs.every((run) => run.script === first) ? first : null;
}

/** The text the runs spell, which is the label's `text` field. */
export const runsText = (runs: TextRun[]) =>
  runs.map((run) => run.text).join("");

/** How many characters the runs cover. */
export const runsLength = (runs: TextRun[]) =>
  runs.reduce((total, run) => total + [...run.text].length, 0);

/**
 * The treatments a range carries, which is what the buttons under the
 * field light up from. A treatment counts as on only if *every* character
 * in the range has it — the usual rule, and the one that makes a second
 * press of a lit button mean "take this off all of it".
 *
 * An empty range is a caret rather than a selection, and reads the
 * character *before* it: walking through "Jérôme" with the arrow keys and
 * stopping after the underlined "r" should light U, which is what makes
 * the row a readout of where you are as well as a set of switches. At the
 * very start of the text there is no character before, so it reads the
 * one after.
 */
export function emphasisIn(
  runs: TextRun[],
  from: number,
  to: number,
  fallback: Emphasis,
): Emphasis {
  const attrs = perCharacter(runs);
  const slice =
    from === to
      ? [attrs[from - 1] ?? attrs[from]].filter(
          (entry): entry is Emphasis => entry !== undefined,
        )
      : attrs.slice(from, to);
  if (slice.length === 0) return fallback;

  const first = slice[0];
  return {
    bold: slice.every((entry) => entry.bold),
    italic: slice.every((entry) => entry.italic),
    underline: slice.every((entry) => entry.underline),
    // Exclusive rather than flags, so "all of them agree" is the only
    // thing that can light one of the casing or script buttons; a range
    // that straddles two casings lights none of the three.
    transform: slice.every((entry) => entry.transform === first.transform)
      ? first.transform
      : "none",
    script: slice.every((entry) => entry.script === first.script)
      ? first.script
      : "none",
  };
}

/** The same range with `patch` applied to it, every other character left
 * as it was. */
export function applyEmphasis(
  runs: TextRun[],
  from: number,
  to: number,
  patch: Partial<Emphasis>,
): TextRun[] {
  const characters = [...runsText(runs)];
  const attrs = perCharacter(runs).map((entry, index) =>
    index >= from && index < to ? { ...entry, ...patch } : entry,
  );
  return fromCharacters(characters, attrs);
}

/**
 * The runs after the text itself was edited — a keystroke, a paste, a
 * deletion — found by matching what the two strings still share at each
 * end rather than by tracking the field's own edit, which `onChange`
 * doesn't report.
 *
 * Inserted text takes the emphasis of the character to its left, the way
 * typing at the end of a bold word stays bold; at the very start of the
 * text there is nothing to its left, so it takes the character to its
 * right instead, and in an empty field it takes the label's flat fields.
 */
export function reflowRuns(
  runs: TextRun[],
  previous: string,
  next: string,
  fallback: Emphasis,
): TextRun[] {
  const before = [...previous];
  const after = [...next];
  const attrs = perCharacter(runs);

  let head = 0;
  while (
    head < before.length &&
    head < after.length &&
    before[head] === after[head]
  ) {
    head += 1;
  }
  let tail = 0;
  while (
    tail < before.length - head &&
    tail < after.length - head &&
    before[before.length - 1 - tail] === after[after.length - 1 - tail]
  ) {
    tail += 1;
  }

  const removed = before.length - head - tail;
  const added = after.length - head - tail;
  const inherited =
    attrs[head - 1] ?? attrs[head + removed] ?? attrs[head] ?? fallback;

  return fromCharacters(after, [
    ...attrs.slice(0, head),
    ...(Array.from({ length: added }, () => ({ ...inherited })) as Emphasis[]),
    ...attrs.slice(head + removed),
  ]);
}

/**
 * A DOM selection offset, which counts UTF-16 code units, as the code
 * point position the runs count in. An offset that lands inside a
 * surrogate pair — which the browser won't hand out, but a programmatic
 * one could — rounds up to the end of that character rather than halving
 * an emoji.
 */
export function codePointIndex(text: string, offset: number): number {
  let count = 0;
  let at = 0;
  while (at < offset && at < text.length) {
    at += (text.codePointAt(at) ?? 0) > 0xffff ? 2 : 1;
    count += 1;
  }
  return count;
}

/** The way back, for putting a selection the buttons moved through back
 * onto the field. */
export function codeUnitIndex(text: string, position: number): number {
  let at = 0;
  for (let count = 0; count < position && at < text.length; count += 1) {
    at += (text.codePointAt(at) ?? 0) > 0xffff ? 2 : 1;
  }
  return at;
}
