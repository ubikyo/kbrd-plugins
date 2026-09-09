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
          "font and its size in millimetres, its colour, and the three " +
          "emphases — each an independent two-state button, since any " +
          "combination of them is valid.\n\n" +
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
