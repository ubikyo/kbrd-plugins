import type { Meta, StoryObj } from "@storybook/react-vite";

import UnitSelect, { type Unit } from "./UnitSelect";
import { Controlled } from "../stories/harness";

const meta = {
  title: "UX/UnitSelect",
  component: UnitSelect,
  parameters: {
    docs: {
      description: {
        component:
          "The `%` / `mm` dropdown leading a pair of numeric property " +
          "fields — shown once for both, since an X in millimetres " +
          "beside a Y in percent would be two coordinate systems for one " +
          "point.",
      },
    },
  },
  args: {
    "aria-label": "Unit",
  },
} satisfies Meta<typeof UnitSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const render: Story["render"] = (args) => (
  <Controlled<Unit> initial={args.value}>
    {(value, onChange) => (
      <UnitSelect {...args} value={value} onChange={onChange} />
    )}
  </Controlled>
);

/** `%` is `DEFAULT_UNIT`: a share of the cell, which is what a position
 * or a size means before anyone reaches for absolute numbers. */
export const Relative: Story = {
  args: { value: "%", onChange: () => {} },
  render,
};

/** Absolute, in the display's own millimetres. */
export const Absolute: Story = {
  args: { value: "mm", onChange: () => {} },
  render,
};

export const Disabled: Story = {
  args: { value: "%", onChange: () => {}, disabled: true },
  render,
};
