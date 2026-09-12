import type { Meta, StoryObj } from "@storybook/react-vite";

import Typography, { type TypographyConfig } from "./Typography";
import { BlockHarness } from "../stories/harness";

const meta = {
  title: "Blocks/Typography",
  component: Typography,
  parameters: {
    docs: {
      description: {
        component:
          "The text an element draws and how it's drawn: the string, the " +
          "font and its size in millimetres, its colour, and a row of " +
          "buttons under them.\n\n" +
          "All eight sit on one line, and the spacing is what groups " +
          "them. The emphases (**B** *I* <u>U</u>) hold the left edge — " +
          "independent two-state buttons, since any combination of them " +
          "is valid. Against the right edge are two exclusive sets: " +
          "casing (`Aa` capitalize, `AA` uppercase, `aa` lowercase) is " +
          "one and script (`A²` superscript, `A₂` subscript) the other, " +
          "so at most one of each can be lit and clicking the lit one " +
          "turns it off.\n\n" +
          "Three gaps, each tighter than the last and each saying the " +
          "same thing more strongly: the wide space between the " +
          "emphases and the rest, 5px between the two exclusive sets, " +
          "3px inside a set. A lit button from each of the three blocks " +
          "can coexist; two from the same block cannot.\n\n" +
          "**All eight apply to whatever is selected in the Text " +
          "field.** Select the `r` of `Jérôme`, press <u>U</u>, and only " +
          "that letter is underlined; select the `2` of `H2O`, press " +
          "`A₂`, and only that one drops. With nothing selected they " +
          "apply to the whole label, so the plain gesture still does the " +
          "plain thing. They read the selection back as well as write " +
          "it — walking the caret through the text with the arrow keys " +
          "lights whichever of them the character behind it carries, and " +
          "a button is lit only when *every* character addressed has it. " +
          "The row holds the selection while you press it, so several in " +
          "a row can be applied to the same letters.\n\n" +
          "The colour, the font and the size stay whole-label: one label " +
          "is one drawn string in both renderers, and those three are " +
          "what it is drawn as.\n\n" +
          "Script is the one treatment the device can't match exactly " +
          "piece by piece. A label whose script is uniform is drawn as " +
          "it always was — whole string shrunk, whole line moved off its " +
          "baseline by the ratios in `typography.ts` — and stays exact. " +
          "A label that *mixes* them goes through Kivy markup, whose " +
          "`[sup]`/`[sub]` place the piece from the font's own metrics " +
          "rather than those ratios, so it sits a little differently on " +
          "the hardware than in the preview. `[size=]` puts the size " +
          "ratio back; the offset is Kivy's.\n\n" +
          "A label whose emphasis is uniform stores exactly the flat " +
          "fields it always did; `spans` appears only once two parts of " +
          "it are treated differently, and goes away again when they " +
          "aren't. See `shared/web/textRuns.ts`.\n\n" +
          "Casing and script are not left to CSS: the string is recased " +
          "and the script resolved to a font size and a baseline offset " +
          "before anything is drawn, because the device's own Kivy " +
          "renderer has no equivalent for either and has to draw the " +
          "same label. See `shared/web/typography.ts`.\n\n" +
          "`+` stores the values already on show (the plugin's defaults, " +
          "unless something was set); `×` drops them all again, leaving " +
          "the renderer back on those defaults. The group counts as " +
          "present as soon as *any one* of its fields is stored.\n\n" +
          "The font list comes from `GET /api/fonts`. Storybook has no " +
          "KBRD-API behind it, so the four fonts offered here are the " +
          "stub's — see `.storybook/api-stub.ts`.",
      },
    },
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

// `kbrd.render-label`'s own manifest — see `render-label/plugin.json`.
const DEFAULTS: TypographyConfig = {
  text: "Label",
  size: 8,
  color: "#ffffff",
  font: "Inter_18pt-Regular.ttf",
  bold: false,
  italic: false,
  underline: false,
  transform: "none",
  script: "none",
};

export const Unset: Story = {
  args: { config: DEFAULTS, stored: {}, onChange: () => {} },
  render: () => (
    <BlockHarness<TypographyConfig> defaults={DEFAULTS}>
      {(props) => <Typography {...props} />}
    </BlockHarness>
  ),
};

/** A label that has been styled: bold, larger, and green. */
export const Styled: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<TypographyConfig>
      defaults={DEFAULTS}
      initialStored={{
        text: "Escape",
        size: 10,
        color: "#00ff00",
        font: "JetBrainsMono-Regular.ttf",
        bold: true,
        italic: false,
        underline: false,
      }}
    >
      {(props) => <Typography {...props} />}
    </BlockHarness>
  ),
};

/**
 * One field stored and no other — enough for the group to count as
 * present, which is what lets `×` clear the lot in one gesture. Older
 * instances can also still carry a named size (`"md"`) where this one has
 * a number; `fontSizeValue` resolves either.
 */
export const NamedSize: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<TypographyConfig>
      defaults={DEFAULTS}
      initialStored={{ size: "md" }}
    >
      {(props) => <Typography {...props} />}
    </BlockHarness>
  ),
};

/**
 * A label with two treatments in it — the `r` of `Jérôme` underlined and
 * nothing else — which is what `spans` is for. Click into the field and
 * walk the caret across with the arrow keys: <u>U</u> lights as it passes
 * the `r`. Select a different letter and press <u>U</u> to underline that
 * one too; undo them both and `spans` disappears from the stored config
 * again.
 */
export const PartlyEmphasised: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<TypographyConfig>
      defaults={DEFAULTS}
      initialStored={{
        text: "Jérôme",
        spans: [
          { length: 2 },
          { length: 1, underline: true },
          { length: 3 },
        ],
      }}
    >
      {(props) => <Typography {...props} />}
    </BlockHarness>
  ),
};

/**
 * `H₂O` — the case the script buttons exist for. The `2` alone carries
 * the subscript, so the label mixes scripts and is drawn piece by piece;
 * pressing `A₂` again with the whole label addressed takes it off and
 * `spans` disappears.
 */
export const MixedScript: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<TypographyConfig>
      defaults={DEFAULTS}
      initialStored={{
        text: "H2O",
        spans: [{ length: 1 }, { length: 1, script: "sub" }, { length: 1 }],
      }}
    >
      {(props) => <Typography {...props} />}
    </BlockHarness>
  ),
};

export const Disabled: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<TypographyConfig>
      defaults={DEFAULTS}
      initialStored={{ text: "Escape" }}
    >
      {(props) => <Typography {...props} disabled />}
    </BlockHarness>
  ),
};
