import type { Meta, StoryObj } from "@storybook/react-vite";

import TextField from "./TextField";
import { Controlled } from "../stories/harness";

const meta = {
  title: "UX/TextField",
  component: TextField,
  parameters: {
    docs: {
      description: {
        component:
          "The same bargain as `Color` and `NumberField` — unstyled, no " +
          "label beyond `aria-label`. Unlike `NumberField` it keeps no " +
          "draft: an empty string is a value in its own right here, not " +
          "a keystroke on the way somewhere, so it goes straight up.",
      },
    },
  },
  args: {
    "aria-label": "Text",
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const render: Story["render"] = (args) => (
  <Controlled<string> initial={args.value}>
    {(value, onChange) => (
      <TextField {...args} value={value} onChange={onChange} />
    )}
  </Controlled>
);

export const Default: Story = {
  args: { value: "Escape", onChange: () => {} },
  render,
};

/** As the Typography block shows it — led by the word "Text". */
export const WithLead: Story = {
  args: { ...Default.args, lead: "Text" },
  render,
};

/** Empty, which is a value: the placeholder is all that's left. */
export const Placeholder: Story = {
  args: { ...Default.args, value: "", placeholder: "Label" },
  render,
};

export const Disabled: Story = {
  args: { ...Default.args, disabled: true },
  render,
};
