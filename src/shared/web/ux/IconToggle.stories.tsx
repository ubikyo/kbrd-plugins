import { Group } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  MdFormatBold,
  MdFormatItalic,
  MdFormatUnderlined,
  MdHeight,
  MdLink,
} from "react-icons/md";

import IconToggle from "./IconToggle";
import { Controlled } from "../stories/harness";

const meta = {
  title: "UX/IconToggle",
  component: IconToggle,
  parameters: {
    docs: {
      description: {
        component:
          "One of the little two-state icon buttons the property panels " +
          "are built from. The border is the only thing saying whether " +
          "it's on — a white rule for on, and *transparent* rather than " +
          "absent for off, so switching one on doesn't shift the row by " +
          "a pixel.",
      },
    },
  },
} satisfies Meta<typeof IconToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

const render: Story["render"] = (args) => (
  <Controlled<boolean> initial={args.active}>
    {(active, setActive) => (
      <IconToggle {...args} active={active} onClick={() => setActive(!active)} />
    )}
  </Controlled>
);

export const Off: Story = {
  args: { label: "Bold", Icon: MdFormatBold, active: false, onClick: () => {} },
  render,
};

export const On: Story = {
  args: { ...Off.args, active: true },
  render,
};

/** Degrees to turn the glyph by, for a row built out of one glyph shown
 * at several angles — the Dimension block's height marker turned into a
 * width one. */
export const Rotated: Story = {
  args: { ...Off.args, label: "Width", Icon: MdHeight, rotate: -90 },
  render,
};

export const Disabled: Story = {
  args: { ...Off.args, Icon: MdLink, label: "Lock ratio", disabled: true },
  render,
};

/** How they actually appear: the Typography block's three emphases, each
 * an independent two-state button because any combination is valid. */
export const EmphasisRow: Story = {
  args: { ...Off.args },
  render: () => (
    <Group gap={4}>
      {(
        [
          ["Bold", MdFormatBold],
          ["Italic", MdFormatItalic],
          ["Underline", MdFormatUnderlined],
        ] as const
      ).map(([label, Icon]) => (
        <Controlled<boolean> key={label} initial={label === "Bold"}>
          {(active, setActive) => (
            <IconToggle
              label={label}
              Icon={Icon}
              active={active}
              onClick={() => setActive(!active)}
            />
          )}
        </Controlled>
      ))}
    </Group>
  ),
};
