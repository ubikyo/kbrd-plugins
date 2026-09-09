import type { Meta, StoryObj } from "@storybook/react-vite";

import Dimension, { type DimensionConfig } from "./Dimension";
import { BlockHarness } from "../stories/harness";

const meta = {
  title: "Blocks/Dimension",
  component: Dimension,
  parameters: {
    docs: {
      description: {
        component:
          "How big the element is: a width/height pair in `%` or `mm`, " +
          "with a ratio lock between them.\n\n" +
          "The lock is deliberately a plain flag rather than a stored " +
          "ratio — the shape it preserves is whatever the two fields " +
          "currently say, so switching it on never changes what's on " +
          "screen, and every edit afterwards keeps the proportion the " +
          "element had at that moment. Lock it, then drag one side.\n\n" +
          "A fresh group seeds half a keycap either way (50% of the " +
          "cell, or 8mm of a 16mm one): `UNIT_ORIGIN`'s own `0` is the " +
          "right seed for a *coordinate* and the wrong one for a size, " +
          "which at 0 isn't there at all.",
      },
    },
  },
} satisfies Meta<typeof Dimension>;

export default meta;
type Story = StoryObj<typeof meta>;

// `kbrd.render-rectangle`'s own manifest — see
// `render-rectangle/plugin.json`.
const DEFAULTS: DimensionConfig = {
  dimensionUnit: "%",
  width: 50,
  height: 50,
  lockRatio: false,
};

/** Not set: the element is sized however its own renderer sizes it. */
export const Unset: Story = {
  args: { config: DEFAULTS, stored: {}, onChange: () => {} },
  render: () => (
    <BlockHarness<DimensionConfig> defaults={DEFAULTS}>
      {(props) => <Dimension {...props} />}
    </BlockHarness>
  ),
};

/** Half the cell either way, which is what `+` seeds. */
export const Relative: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<DimensionConfig>
      defaults={DEFAULTS}
      initialStored={{
        dimensionUnit: "%",
        width: 50,
        height: 50,
        lockRatio: false,
      }}
    >
      {(props) => <Dimension {...props} />}
    </BlockHarness>
  ),
};

/** A 2:1 shape with the ratio locked — editing either side now drags the
 * other along. */
export const RatioLocked: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<DimensionConfig>
      defaults={DEFAULTS}
      initialStored={{
        dimensionUnit: "mm",
        width: 16,
        height: 8,
        lockRatio: true,
      }}
    >
      {(props) => <Dimension {...props} />}
    </BlockHarness>
  ),
};

export const Disabled: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<DimensionConfig>
      defaults={DEFAULTS}
      initialStored={{ dimensionUnit: "%", width: 50, height: 50 }}
    >
      {(props) => <Dimension {...props} disabled />}
    </BlockHarness>
  ),
};
