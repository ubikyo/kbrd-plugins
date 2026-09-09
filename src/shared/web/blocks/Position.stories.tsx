import type { Meta, StoryObj } from "@storybook/react-vite";

import Position, { DEFAULT_ANCHOR, type PositionConfig } from "./Position";
import { BlockHarness } from "../stories/harness";

const meta = {
  title: "Blocks/Position",
  component: Position,
  parameters: {
    docs: {
      description: {
        component:
          "Where the element sits: an X/Y pair in `%` or `mm`, the point " +
          "of the element those coordinates address (`AnchorGrid`), and " +
          "six one-click alignments.\n\n" +
          "The group's own presence is the switch — `precisePlacement` " +
          "is the flag every renderer already reads to mean \"use x/y " +
          "instead of the Layout editor's `Placement` grid\", so adding " +
          "the group sets it and removing it clears it. No second " +
          "coordinate pair beside the one that exists.\n\n" +
          "Each alignment drops the element on a share of the cell " +
          "*and* anchors the matching side of it there — that pair of " +
          "settings is what \"aligned left\" actually means. They only " +
          "make sense in `%`, so switching the unit to `mm` disables " +
          "them: an alignment is relative by definition, and 50/100 " +
          "have no millimetre equivalent this editor could compute — it " +
          "never sees the cell's size.",
      },
    },
  },
} satisfies Meta<typeof Position>;

export default meta;
type Story = StoryObj<typeof meta>;

// `kbrd.render-label`'s own placement defaults — see
// `render-label/plugin.json`.
const DEFAULTS: PositionConfig = {
  precisePlacement: false,
  positionUnit: "%",
  x: 50,
  y: 50,
  anchor: DEFAULT_ANCHOR,
};

/** Not set: the element is placed by the Layout editor's nine-way grid
 * instead. */
export const Unset: Story = {
  args: { config: DEFAULTS, stored: {}, onChange: () => {} },
  render: () => (
    <BlockHarness<PositionConfig> defaults={DEFAULTS}>
      {(props) => <Position {...props} />}
    </BlockHarness>
  ),
};

/** Freshly added: centred on the cell, which is what `middle-center` and
 * 50/50 come to together. */
export const Centered: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<PositionConfig>
      defaults={DEFAULTS}
      initialStored={{
        precisePlacement: true,
        positionUnit: "%",
        x: 50,
        y: 50,
        anchor: "middle-center",
      }}
    >
      {(props) => <Position {...props} />}
    </BlockHarness>
  ),
};

/** In millimetres, measured from the cell's top-left corner to the
 * element's own — and with the alignment row disabled, since there's
 * nothing relative left for it to mean. */
export const Millimetres: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<PositionConfig>
      defaults={DEFAULTS}
      initialStored={{
        precisePlacement: true,
        positionUnit: "mm",
        x: 2,
        y: 3,
        anchor: "top-left",
      }}
    >
      {(props) => <Position {...props} />}
    </BlockHarness>
  ),
};

export const Disabled: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<PositionConfig>
      defaults={DEFAULTS}
      initialStored={{ precisePlacement: true }}
    >
      {(props) => <Position {...props} disabled />}
    </BlockHarness>
  ),
};
