import { Box, Text } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import PropertyGroup from "./PropertyGroup";

const meta = {
  title: "UX/PropertyGroup",
  component: PropertyGroup,
  parameters: {
    docs: {
      description: {
        component:
          "One addable/removable property group in a Properties panel — " +
          "Figma's \"group header with a +/× button\" pattern. It owns " +
          "none of the property-specific logic, only its own header and " +
          "whether the content is expanded.\n\n" +
          "`active` (does the property exist) and `expanded` (is the " +
          "panel open) are kept distinct even though today one drives " +
          "the other, and `onAdd`/`onRemove` are real mutations the " +
          "parent performs — not local state this component could fake. " +
          "The stories below own that state so the buttons actually do " +
          "something.",
      },
    },
  },
} satisfies Meta<typeof PropertyGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const Body = () => (
  <Box px={15} pb={10}>
    <Text size="xs" c="dimmed">
      Whatever the property's own editor draws.
    </Text>
  </Box>
);

/** The `+` state: the property isn't in the config, so the header is the
 * whole row. Adding it is what opens the panel. */
export const Optional: Story = {
  args: { title: "Background", children: <Body /> },
  render: (args) => {
    const [active, setActive] = useState(false);
    return (
      <PropertyGroup
        {...args}
        active={active}
        onAdd={() => setActive(true)}
        onRemove={() => setActive(false)}
      />
    );
  },
};

/** Already in the config on first mount — a group loaded from a saved
 * instance, which `expanded` follows without anyone clicking `+`. */
export const AlreadyActive: Story = {
  ...Optional,
  args: { ...Optional.args, title: "Typography" },
  render: (args) => {
    const [active, setActive] = useState(true);
    return (
      <PropertyGroup
        {...args}
        active={active}
        onAdd={() => setActive(true)}
        onRemove={() => setActive(false)}
      />
    );
  },
};

/**
 * A permanent group: none of `active`/`onAdd`/`onRemove`, so no `+`/`×`
 * and the content is always on show. For a group whose fields have no
 * meaningful "not set" — one the element could never be without, so
 * there would be nothing for a `×` to hand it back to.
 */
export const Permanent: Story = {
  args: { title: "Shape", children: <Body /> },
};

/**
 * Two in a row, which is how a real Properties panel reads — each group
 * draws its own bottom rule, so the list needs no separators of its own.
 */
export const Stacked: Story = {
  args: { title: "", children: null },
  render: () => (
    <Box w={300}>
      {["Position", "Dimension", "Background"].map((title) => (
        <StackedGroup key={title} title={title} />
      ))}
    </Box>
  ),
};

function StackedGroup({ title }: { title: string }) {
  const [active, setActive] = useState(title === "Position");
  return (
    <PropertyGroup
      title={title}
      active={active}
      onAdd={() => setActive(true)}
      onRemove={() => setActive(false)}
    >
      <Body />
    </PropertyGroup>
  );
}
