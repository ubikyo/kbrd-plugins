import type { Meta, StoryObj } from "@storybook/react-vite";

import AnchorGrid, { type AnchorValue } from "./AnchorGrid";
import { Controlled } from "../stories/harness";

const meta = {
  title: "UX/AnchorGrid",
  component: AnchorGrid,
  parameters: {
    docs: {
      description: {
        component:
          "Nine 7px squares, one of them on: which point of a box a pair " +
          "of coordinates addresses. Not `Placement`'s 3x3 picker — that " +
          "one chooses where a box sits *on the element*, this one says " +
          "which point *of the box* the X/Y refer to.",
      },
    },
  },
  args: {
    "aria-label": "Anchor",
  },
} satisfies Meta<typeof AnchorGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The default a fresh Position group seeds itself with — the element
 * centred on the cell. */
export const Default: Story = {
  args: { value: "middle-center", onChange: () => {} },
  render: (args) => (
    <Controlled<AnchorValue> initial={args.value}>
      {(value, onChange) => (
        <AnchorGrid {...args} value={value} onChange={onChange} />
      )}
    </Controlled>
  ),
};

/** The origin corner: X/Y measured to the element's own top-left. */
export const TopLeft: Story = {
  ...Default,
  args: { ...Default.args, value: "top-left" },
};

/** Greyed out with the rest of a disabled property panel — still shows
 * which point is addressed, just can't be moved. */
export const Disabled: Story = {
  ...Default,
  args: { ...Default.args, value: "bottom-right", disabled: true },
};
