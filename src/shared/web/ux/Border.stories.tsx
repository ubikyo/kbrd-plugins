import type { Meta, StoryObj } from "@storybook/react-vite";

import Border, { type BorderValue } from "./Border";
import { Controlled } from "../stories/harness";

const meta = {
  title: "UX/Border",
  component: Border,
  parameters: {
    docs: {
      description: {
        component:
          "Colour / style / width on one line, handed back as one " +
          "`BorderValue`. The style dropdown shows a short rule drawn in " +
          "the style itself rather than the word for it — which is why " +
          "it's Mantine's `Combobox` primitive and not a `Select`, whose " +
          "closed field can only hold text.\n\n" +
          "The colour field deliberately opts out of `Color`'s Opacity " +
          "half: a border that can be faded to nothing while still " +
          "costing its width is a worse control than a plain `#rrggbb` " +
          "one.",
      },
    },
  },
} satisfies Meta<typeof Border>;

export default meta;
type Story = StoryObj<typeof meta>;

const render: Story["render"] = (args) => (
  <Controlled<BorderValue> initial={args.value}>
    {(value, onChange) => <Border {...args} value={value} onChange={onChange} />}
  </Controlled>
);

/** What the Border block seeds a fresh group with. */
export const Default: Story = {
  args: {
    value: { color: "#ffffff", style: "solid", width: 1 },
    onChange: () => {},
  },
  render,
};

export const Dashed: Story = {
  args: {
    value: { color: "#00ff00", style: "dashed", width: 2 },
    onChange: () => {},
  },
  render,
};

export const Dotted: Story = {
  args: {
    value: { color: "#ff0055", style: "dotted", width: 3 },
    onChange: () => {},
  },
  render,
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
  render,
};
