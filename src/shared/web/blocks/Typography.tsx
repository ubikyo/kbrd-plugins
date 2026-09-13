import { Box, Group, Select } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import type { IconType } from "react-icons";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
} from "react-icons/md";

import { fontSizeValue, type FontSize } from "../fontSize";
import {
  applyEmphasis,
  codePointIndex,
  emphasisIn,
  reflowRuns,
  resolveRuns,
  runsLength,
  storedRuns,
  type Emphasis,
  type TextSpan,
} from "../textRuns";
import type { TextScript, TextTransform } from "../typography";
import Color from "../ux/Color";
import IconToggle from "../ux/IconToggle";
import NumberField from "../ux/NumberField";
import PropertyGroup from "../ux/PropertyGroup";
import TextField, { type TextSelection } from "../ux/TextField";
import type { BlockProps } from "./block";

/** What the Typography block owns — the text itself and everything about
 * how it's drawn. */
export type TypographyConfig = {
  text: string;
  // Millimetres, as a plain number. Older instances may still carry one
  // of the named steps ("md"…) — `fontSizeValue` resolves either.
  size: FontSize;
  color: string;
  font?: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  // Casing and script, each resolved before the text is drawn rather
  // than left to the renderer — see `shared/web/typography.ts`.
  transform: TextTransform;
  script: TextScript;
  // Present only on a label whose emphasis isn't the same all the way
  // through, in which case the five fields above are what a reader that
  // ignores this one draws — see `shared/web/textRuns.ts`.
  spans?: TextSpan[];
};

export const TYPOGRAPHY_KEYS = [
  "text",
  "font",
  "size",
  "color",
  "bold",
  "italic",
  "underline",
  "transform",
  "script",
  "spans",
] as const;

// Every button in this block's one button row, in pixels — shorter than
// the 28px square `IconToggle` draws on its own, and the same 20px
// `Position`'s alignment row uses (see `ALIGN_SIZE` there), which is what
// keeps the two rows of shortcuts in the Properties panel reading as one
// kind of control. The row sits under the fields it writes to as their
// shortcuts; at full height these would be the tallest thing in the group
// and read as its main control instead. Eight of them also have to fit
// one line of the panel, which at 28px they wouldn't.
//
// Small enough that the outlined "on" state stops carrying — a 1px rule
// on a 20px plate is barely there — so every one of them is `filled`:
// lit means the plate itself flips, ground and glyph trading places.
const BUTTON_SIZE = 20;

// Any combination of the three is valid, so each is its own independent
// two-state button.
const EMPHASES: {
  key: "bold" | "italic" | "underline";
  label: string;
  Icon: IconType;
}[] = [
  { key: "bold", label: "Bold", Icon: MdFormatBold },
  { key: "italic", label: "Italic", Icon: MdFormatItalic },
  { key: "underline", label: "Underline", Icon: MdFormatUnderlined },
];

/**
 * The right-hand end of the button row, in two sets, both worked the same
 * way: several buttons over one treatment, of which at most one is ever
 * on. Clicking the lit one turns it off — the text goes back to being
 * drawn as it was typed — so every state is reachable from the row
 * without a fourth "off" button that would say nothing.
 *
 * Each button's face is a sample of what it does rather than an icon:
 * "AA" for uppercase is both shorter and plainer than any glyph for it,
 * and the two script options have no icon at all in Material.
 */
const TRANSFORMS: { value: TextTransform; label: string; glyph: string }[] = [
  // CSS's own `capitalize`: first letter of each word up, the rest left
  // alone (see `transformText`).
  { value: "capitalize", label: "Capitalize", glyph: "Aa" },
  { value: "uppercase", label: "Uppercase", glyph: "AA" },
  { value: "lowercase", label: "Lowercase", glyph: "aa" },
];

const SCRIPTS: { value: TextScript; label: string; glyph: string }[] = [
  { value: "super", label: "Superscript", glyph: "A²" },
  { value: "sub", label: "Subscript", glyph: "A₂" },
];

/**
 * One installed face, as `GET /api/fonts` describes it: the filename a
 * config stores, and the family and style the file itself claims — read
 * out of its own `name` table rather than guessed from the filename,
 * which is what lets the picker below be two fields instead of a list of
 * filenames. See `kbrd_api/fonts.py`.
 */
type FontOption = {
  value: string;
  label: string;
  family: string;
  // Empty where the file names no style at all, which is what `NO_STYLE`
  // stands in for.
  style: string;
};

/**
 * What the Style field shows for a face whose file names no style.
 *
 * It is the field's own word, not the font's: a family of one unnamed
 * face — anything whose name table couldn't be read — would otherwise
 * leave the field standing empty, reading as a control that failed
 * rather than one with nothing to choose. "Regular" because that is what
 * a face with nothing said about it *is*, and a field reading the same
 * word here as it does over a font that names its own Regular is telling
 * the truth either way.
 */
const NO_STYLE = "Regular";

/** The face a family opens on when it is picked by family alone. */
const defaultFace = (faces: FontOption[]) =>
  faces.find(({ style }) => style === "" || style.toLowerCase() === "regular") ??
  faces[0];

// One request for the whole app: the list is the same for every editor
// instance, and mounting a second one shouldn't re-fetch it.
let fontsRequest: Promise<FontOption[]> | undefined;

function loadFonts() {
  fontsRequest ??= fetch("/api/fonts").then(async (response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as FontOption[];
  });
  return fontsRequest;
}

/**
 * The text an element draws and how it's drawn: the string, the font and
 * its size in millimetres, its colour, and the emphases.
 *
 * Every one of the eight buttons applies to whatever is selected in the
 * Text field rather than to the whole label, which is what lets one
 * letter of a label be underlined and the rest not, or the "2" of "H2O"
 * be the only thing that drops (see `shared/web/textRuns.ts`). With
 * nothing selected they apply to all of it, so the plain gesture — click
 * into the field, press B — still does the plain thing. The buttons read
 * the selection back as well as write it: walking the caret through the
 * text with the arrow keys lights whichever of them the character behind
 * it carries.
 *
 * The colour, the font and the size stay whole-label: one label is one
 * drawn string in both renderers, and those three are what it is drawn
 * as.
 *
 * `+` stores the values already on show (the plugin's defaults, unless
 * something was set); `×` drops them all again, leaving the renderer back
 * on those defaults.
 */
export default function Typography<T extends TypographyConfig>({
  config,
  stored,
  onChange,
  disabled = false,
}: BlockProps<T>) {
  const [fonts, setFonts] = useState<FontOption[]>([]);
  const [fontError, setFontError] = useState<string | null>(null);
  // `null` until the Text field is focused, and again once it is left —
  // which is the state in which the buttons address the whole label.
  const [selection, setSelection] = useState<TextSelection | null>(null);

  useEffect(() => {
    let cancelled = false;
    void loadFonts()
      .then((values) => {
        if (!cancelled) {
          setFonts(values);
          setFontError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setFonts([]);
          setFontError(
            cause instanceof Error ? cause.message : "Unable to load fonts",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // The installed faces grouped under the family each one names, in the
  // order the API sent them: families alphabetically, and inside one the
  // order a specimen runs in. A `Map` is what keeps that order — an
  // object would re-sort nothing, but reading its keys back is a
  // guarantee only for string keys that aren't numbers, and a family
  // called "1942" is a real font.
  const families = useMemo(() => {
    const grouped = new Map<string, FontOption[]>();
    for (const font of fonts) {
      const existing = grouped.get(font.family);
      if (existing) existing.push(font);
      else grouped.set(font.family, [font]);
    }
    return grouped;
  }, [fonts]);

  // The face the config names, and the family it belongs to. Both are
  // `undefined` until the list arrives, and stay that way for a config
  // pointing at a font that has since been removed — in which case the
  // two fields stand empty rather than claiming a font that isn't there.
  const face = fonts.find(({ value }) => value === config.font);
  const faces = (face && families.get(face.family)) ?? [];

  /**
   * A family picked by name, resolved back to one of its files.
   *
   * The style is carried across where the new family has one of the same
   * name — going from Inter SemiBold to Quicksand lands on Quicksand
   * SemiBold, not back on Regular — and otherwise falls to whatever the
   * family opens on. Matching by name rather than by weight is
   * deliberate: two families' "Medium" are the same intent even where
   * their `usWeightClass` differs, which for a family with no Medium at
   * all is the right place to give up rather than round to a neighbour.
   */
  function writeFamily(family: string) {
    const candidates = families.get(family) ?? [];
    const kept = face
      ? candidates.find(
          ({ style }) => style.toLowerCase() === face.style.toLowerCase(),
        )
      : undefined;
    const next = kept ?? defaultFace(candidates);
    if (next) write({ font: next.value });
  }

  // One cast, here — see `Position` for why.
  const write = (patch: Partial<TypographyConfig>) => {
    const next = { ...stored, ...patch } as Record<string, unknown>;
    // A label that has gone back to being uniform stores no spans at all
    // rather than an empty key — see `storedRuns`.
    if (next.spans === undefined) delete next.spans;
    onChange(next as Partial<T>);
  };

  function add() {
    const added: Partial<T> = { ...stored };
    for (const key of TYPOGRAPHY_KEYS) {
      if (config[key] === undefined) continue;
      (added as Record<string, unknown>)[key] = config[key];
    }
    onChange(added);
  }

  function remove() {
    const remaining: Partial<T> = { ...stored };
    for (const key of TYPOGRAPHY_KEYS) delete remaining[key];
    onChange(remaining);
  }

  // The label as it is actually made up, and the four fields a piece of
  // it falls back on when it sets none of its own.
  const base: Emphasis = {
    bold: config.bold,
    italic: config.italic,
    underline: config.underline,
    transform: config.transform,
    script: config.script,
  };
  const runs = resolveRuns(config.text, config.spans, base);
  const length = runsLength(runs);

  // What the buttons read, in the code points the runs count in. With the
  // field unfocused that's the whole label.
  const from = selection ? codePointIndex(config.text, selection.start) : 0;
  const to = selection ? codePointIndex(config.text, selection.end) : length;
  const shown = emphasisIn(runs, from, to, base);

  /** What a press acts on: the selection if there is one, and otherwise
   * the whole label — a caret is a place to read from, not a range to
   * write to. */
  function emphasise(patch: Partial<Emphasis>) {
    // An empty label has no piece to aim at, so the press goes straight
    // into the flat fields — which is where whatever gets typed next
    // picks it up from.
    if (length === 0) {
      write({ ...base, ...patch });
      return;
    }
    const target = from === to ? { from: 0, to: length } : { from, to };
    write(
      storedRuns(applyEmphasis(runs, target.from, target.to, patch), base),
    );
  }

  /** An edit to the string itself, with the pieces carried across it. A
   * label that is uniform before and after writes nothing but its text,
   * which is what keeps an ordinary label storing exactly what it always
   * did. */
  function writeText(value: string) {
    const next = storedRuns(reflowRuns(runs, config.text, value, base), base);
    if (next.spans === undefined && stored.spans === undefined) {
      write({ text: value });
      return;
    }
    write({ text: value, ...next });
  }

  return (
    <PropertyGroup
      title="Typography"
      // Set as soon as any one field is stored: removing the group is what
      // clears them all together.
      active={TYPOGRAPHY_KEYS.some((key) => stored[key] !== undefined)}
      onAdd={add}
      onRemove={remove}
    >
      <TextField
        aria-label="Text"
        lead="Text"
        placeholder="Label"
        value={config.text}
        disabled={disabled}
        onSelectionChange={setSelection}
        onChange={writeText}
      />
      {/* The family on a line of its own, because it is the long name
          of the two and the one worth reading in full: a picker that
          truncated "Noto Sans Symbols 2" to fit a style beside it would
          be hiding the thing being picked. */}
      <Select
        variant="unstyled"
        size="xs"
        mt="xs"
        aria-label="Font"
        placeholder="Choose a font"
        // Two dozen families installed and more uploaded — long enough
        // that typing beats scrolling.
        searchable
        allowDeselect={false}
        data={[...families.keys()]}
        value={face?.family ?? null}
        disabled={disabled}
        error={fontError || undefined}
        onChange={(family) => family && writeFamily(family)}
      />
      {/* The style under it, sharing its line with the size — the two
          short fields, and the two that qualify the family above rather
          than replace it. Both stay put when a family has only one face:
          a field that came and went would move the size out from under
          the pointer. */}
      <Group gap="xs" wrap="nowrap" mt="xs">
        <Select
          variant="unstyled"
          size="xs"
          style={{ flex: 1, minWidth: 0 }}
          aria-label="Style"
          placeholder={NO_STYLE}
          allowDeselect={false}
          // Keyed by filename: the style *is* the file, and picking one
          // is what writes `font`. Already in a specimen's order —
          // romans light to heavy, then italics — which is how the API
          // sorted them.
          data={faces.map(({ value, style }) => ({
            value,
            label: style || NO_STYLE,
          }))}
          value={face?.value ?? null}
          disabled={disabled || faces.length === 0}
          onChange={(value) => value && write({ font: value })}
        />
        <NumberField
          aria-label="Size"
          // Millimetres of real glass, the same unit every renderer reads
          // it as — see `fontSizeValue` and the Kivy renderers' own `mm()`
          // conversion. Worth saying out loud in the field, since nothing
          // about a number between 1 and 999 hints at it.
          suffix=" mm"
          // Whatever this takes comes straight out of the Style select
          // beside it, which fills the rest of the row (`flex: 1`).
          width={63}
          min={1}
          max={999}
          // `fontSizeValue` so an instance still carrying one of the old
          // named steps shows the millimetres it actually resolved to;
          // what gets written back is always a plain number.
          value={fontSizeValue(config.size)}
          disabled={disabled}
          onChange={(next) => write({ size: next })}
        />
      </Group>
      {/* Every button the block has, on one line: the emphases against
          the left edge and the two exclusive sets against the right,
          pushed apart by the space between them.

          That gap is the widest in the row on purpose — it separates the
          buttons that can all be on at once (any combination of bold,
          italic and underline is valid) from the ones that can't. To the
          right of it the spacing tightens twice more, and each step down
          means the same thing one degree more strongly: 5px between the
          two exclusive sets, which write two different treatments, and
          3px inside each set, whose buttons write the same one. So a button
          from each of the three blocks can be lit together ("B", "AA" and
          "A²" is a raised bold label in capitals), while two from the
          same block never can.

          The row keeps the Text field's selection alive: `mousedown` is
          the event that would move focus out of the field, and preventing
          it here — once, for every button at once — is what lets you
          select a letter and then press three of these in turn without
          losing it. Keyboard users are untouched; nothing about Tab and
          Space goes through `mousedown`. */}
      <Group
        gap="sm"
        wrap="nowrap"
        mt="xs"
        justify="space-between"
        onMouseDown={(event) => event.preventDefault()}
      >
        {/* `gap` rather than a margin on each: flex puts the 3px *between*
            buttons, so the last one already ends flush, with nothing after
            it. */}
        <Group gap={3} wrap="nowrap">
          {EMPHASES.map(({ key, label, Icon }) => (
            <IconToggle
              key={key}
              label={label}
              Icon={Icon}
              size={BUTTON_SIZE}
              filled
              // Lit only when *all* of what's addressed carries it, so a
              // selection straddling a bold word and a plain one shows B
              // off and the first press turns the whole selection bold.
              active={shown[key]}
              disabled={disabled}
              onClick={() => emphasise({ [key]: !shown[key] })}
            />
          ))}
        </Group>
        <Group gap={5} wrap="nowrap">
          <Group gap={3} wrap="nowrap">
            {TRANSFORMS.map(({ value, label, glyph }) => (
              <IconToggle
                key={value}
                label={label}
                glyph={glyph}
                size={BUTTON_SIZE}
                filled
                active={shown.transform === value}
                disabled={disabled}
                // Clicking the lit one turns it off — see `TRANSFORMS`.
                onClick={() =>
                  emphasise({
                    transform: shown.transform === value ? "none" : value,
                  })
                }
              />
            ))}
          </Group>
          {/* Selection-bound like the rest, which is what "H2O" needs:
              the 2 drops and nothing else does. A label whose script is
              uniform is still drawn the way it always was — whole string
              shrunk, whole line moved off its baseline — and only a
              mixed one takes the piece-by-piece path. See `uniformScript`
              in `shared/web/textRuns.ts`. */}
          <Group gap={3} wrap="nowrap">
            {SCRIPTS.map(({ value, label, glyph }) => (
              <IconToggle
                key={value}
                label={label}
                glyph={glyph}
                size={BUTTON_SIZE}
                filled
                active={shown.script === value}
                disabled={disabled}
                onClick={() =>
                  emphasise({
                    script: shown.script === value ? "none" : value,
                  })
                }
              />
            ))}
          </Group>
        </Group>
      </Group>
      {/* The colour on its own line, closing the block. It sits under the
          buttons rather than over them because those are shortcuts for
          the text above — the string, its font and its size — and read as
          that text's own row of switches when they follow it directly. A
          field of variable width in between broke that. */}
      <Box mt="xs">
        <Color
          aria-label="Text color"
          withOpacity
          value={config.color}
          disabled={disabled}
          onChange={(value) => write({ color: value })}
        />
      </Box>
    </PropertyGroup>
  );
}
