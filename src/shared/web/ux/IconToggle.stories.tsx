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
          "a pixel.\n\n" +
          "A button's face is either an `Icon` or a `glyph` — a short " +
          "string drawn at the same 16px, for options better shown by an " +
          "example of themselves than by a symbol.",
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

/** A face that is text rather than an icon: the Typography block's
 * casing and script options, where a sample of what the button does
 * ("AA" for uppercase) says it more plainly than any glyph could. Drawn
 * at the icons' own 16px so a row can mix the two. */
export const Glyph: Story = {
  args: {
    label: "Uppercase",
    Icon: undefined,
    glyph: "AA",
    size: 20,
    filled: true,
    active: false,
    onClick: () => {},
  },
  render,
};

/** How they actually appear: the Typography block's three emphases, each
 * an independent two-state button because any combination is valid.
 *
 * 20px plates and `filled`, which go together — at that size a 1px rule
 * has too little edge left to carry the "on" state on its own, so lit
 * means the plate itself flips. The glyphs stay at `ICON_SIZE`; what
 * shrinks is the plate around them. */
export const EmphasisRow: Story = {
  args: { ...Off.args },
  render: () => (
    <Group gap={3}>
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
              size={20}
              filled
              active={active}
              onClick={() => setActive(!active)}
            />
          )}
        </Controlled>
      ))}
    </Group>
  ),
};

/** The row under it, and the two kinds of face side by side: casing
 * (`Aa`/`AA`/`aa`) and script (`A²`/`A₂`), 5px apart because they write
 * two different fields. A `glyph` is sized as a fraction of its own
 * plate rather than pinned to `ICON_SIZE` — "AA" set at an icon's height
 * would be wider than a 20px button. */
export const GlyphRow: Story = {
  args: { ...Off.args },
  render: () => {
    const half = (
      options: readonly (readonly [string, string])[],
      lit: string | null,
    ) => (
      <Group gap={3}>
        {options.map(([label, glyph]) => (
          <Controlled<boolean> key={label} initial={label === lit}>
            {(active, setActive) => (
              <IconToggle
                label={label}
                glyph={glyph}
                size={20}
                filled
                active={active}
                onClick={() => setActive(!active)}
              />
            )}
          </Controlled>
        ))}
      </Group>
    );

    // Nested exactly as the block nests them: 3px inside each half, 5px
    // between the two, which is the only thing saying they are separate
    // fields.
    return (
      <Group gap={5}>
        {half(
          [
            ["Capitalize", "Aa"],
            ["Uppercase", "AA"],
            ["Lowercase", "aa"],
          ],
          "Uppercase",
        )}
        {half(
          [
            ["Superscript", "A\u00B2"],
            ["Subscript", "A\u2082"],
          ],
          null,
        )}
      </Group>
    );
  },
};
