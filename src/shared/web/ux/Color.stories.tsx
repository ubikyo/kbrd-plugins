import type { Meta, StoryObj } from "@storybook/react-vite";

import Color from "./Color";
import { Controlled } from "../stories/harness";

const meta = {
  title: "UX/Color",
  component: Color,
  parameters: {
    docs: {
      description: {
        component:
          "A bare `ColorInput` for the compact property rows. One value " +
          "in, one value out: `#rrggbbaa` with `withOpacity` (a hex " +
          "field plus an opacity field), plain `#rrggbb` without it. The " +
          "alpha byte is deliberately kept out of the hex text — a raw " +
          "`AA` is a worse way to say \"50% opaque\" than \"50 %\" is.",
      },
    },
  },
  args: {
    "aria-label": "Color",
  },
} satisfies Meta<typeof Color>;

export default meta;
type Story = StoryObj<typeof meta>;

/** No Opacity field, so nothing here can make the colour vanish — what a
 * border's own colour uses. */
export const Solid: Story = {
  args: { value: "#ffffff", onChange: () => {} },
  render: (args) => (
    <Controlled<string> initial={args.value}>
      {(value, onChange) => (
        <Color {...args} value={value} onChange={onChange} />
      )}
    </Controlled>
  ),
};

/** With the Opacity half — the Background block's own colour, seeded at
 * white 50% (`#ffffff80`). Type in either field and watch the stored
 * 8-digit value follow. */
export const WithOpacity: Story = {
  ...Solid,
  args: { ...Solid.args, value: "#ffffff80", withOpacity: true },
};

export const Disabled: Story = {
  ...Solid,
  args: { ...Solid.args, value: "#00ff00ff", withOpacity: true, disabled: true },
};
