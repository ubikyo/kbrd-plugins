import { Box, Stack, Switch, TextInput } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import PropertyRow from "./PropertyRow";

const meta = {
  title: "Shared/PropertyRow",
  component: PropertyRow,
  parameters: {
    docs: {
      description: {
        component:
          "The label/control layout every plugin property editor is laid " +
          "out on: a 3fr label column and a 7fr control one. `align` " +
          "picks how the two line up (`start` nudges the label down to " +
          "meet a field's own text, `center` centres it, `top` pins it), " +
          "and `compactControl` pushes a control that doesn't want the " +
          "full width over to the right.",
      },
    },
  },
  decorators: [
    (Story) => (
      <Box w={360}>
        <Story />
      </Box>
    ),
  ],
} satisfies Meta<typeof PropertyRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Website",
    children: <TextInput aria-label="Website" defaultValue="https://" />,
  },
};

/** With the second line of dimmed text a row can carry under its label. */
export const WithDescription: Story = {
  args: {
    label: "Delay",
    description: "Milliseconds before the action fires.",
    children: <TextInput aria-label="Delay" defaultValue="0" />,
  },
};

/** A control sized to itself, pushed to the right rather than stretched
 * across the column — how `Placement` shows its own switch. */
export const CompactControl: Story = {
  args: {
    label: "Precise placement ?",
    align: "center",
    compactControl: true,
    children: <Switch aria-label="Precise placement ?" />,
  },
};

/** Several in a column, which is how an editor actually reads. */
export const Stacked: Story = {
  args: { label: "", children: null },
  render: () => (
    <Stack gap="md">
      <PropertyRow label="Website">
        <TextInput aria-label="Website" defaultValue="https://kbrd.dev" />
      </PropertyRow>
      <PropertyRow label="Browser" description="Falls back to the default.">
        <TextInput aria-label="Browser" defaultValue="Firefox" />
      </PropertyRow>
      <PropertyRow label="New window ?" align="center" compactControl>
        <Switch aria-label="New window ?" />
      </PropertyRow>
    </Stack>
  ),
};
