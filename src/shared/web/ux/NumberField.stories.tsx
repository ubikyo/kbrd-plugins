import type { Meta, StoryObj } from "@storybook/react-vite";
import { MdHeight } from "react-icons/md";

import NumberField from "./NumberField";
import { ICON_SIZE } from "./IconToggle";
import { Controlled } from "../stories/harness";

const meta = {
  title: "UX/NumberField",
  component: NumberField,
  parameters: {
    docs: {
      description: {
        component:
          "A bare `NumberInput` for the compact property rows. It keeps " +
          "its own draft on purpose: a controlled input that throws away " +
          "the empty string can never *look* empty, so clearing it snaps " +
          "the old digits back and leaves a number nothing can remove — " +
          "worst of all when that number is `0`. Going empty is allowed " +
          "here and simply reports nothing upwards; the last real value " +
          "comes back when focus leaves. Clear it and click away to see " +
          "that.",
      },
    },
  },
  args: {
    "aria-label": "Value",
    min: 0,
    width: 70,
  },
} satisfies Meta<typeof NumberField>;

export default meta;
type Story = StoryObj<typeof meta>;

// `number | ""` rather than `number`: the field's own value type, which
// carries "nothing given yet" as the empty string — see the `Required`
// story below.
const render: Story["render"] = (args) => (
  <Controlled<number | ""> initial={args.value}>
    {(value, onChange) => (
      <NumberField {...args} value={value} onChange={onChange} />
    )}
  </Controlled>
);

export const Default: Story = {
  args: { value: 50, onChange: () => {} },
  render,
};

/** A percentage: the `%` drawn inside the field, after the digits. */
export const WithSuffix: Story = {
  args: { ...Default.args, suffix: " %", max: 100 },
  render,
};

/** The short white marker a coordinate pair leads with — see
 * `useLeadSection` for why it isn't Mantine's own `prefix`. */
export const WithTextLead: Story = {
  args: { ...Default.args, lead: "X" },
  render,
};

/** The same slot taking an icon instead of a letter — the Dimension
 * block's own height marker. */
export const WithIconLead: Story = {
  args: {
    ...Default.args,
    value: 8,
    lead: <MdHeight size={ICON_SIZE} />,
  },
  render,
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
  render,
};

/** A required field whose config arrived without a number: the empty
 * string is what "nothing given yet" looks like, and the `error` under it
 * is what asks for one — see `invoke-delay`'s own `Action`. Type a value
 * and the message goes with it. */
export const Required: Story = {
  args: {
    ...Default.args,
    value: "",
    min: 1,
    error: "Enter a delay",
  },
  render: (args) => (
    <Controlled<number | ""> initial={args.value}>
      {(value, onChange) => (
        <NumberField
          {...args}
          value={value}
          error={value === "" ? args.error : undefined}
          onChange={onChange}
        />
      )}
    </Controlled>
  ),
};
