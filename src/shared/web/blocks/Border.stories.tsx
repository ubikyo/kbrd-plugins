import type { Meta, StoryObj } from "@storybook/react-vite";

import Border, { type BorderConfig } from "./Border";
import { BlockHarness } from "../stories/harness";

const meta = {
  title: "Blocks/Border",
  component: Border,
  parameters: {
    docs: {
      description: {
        component:
          "The element's own outline — colour, style and width on one " +
          "line.\n\n" +
          "Unlike the other blocks this one has its own switch, " +
          "`borderEnabled`, which every manifest defaults to `false`, so " +
          "its absence already reads as \"no border\". Closing the group " +
          "drops all four fields so those manifest defaults take over " +
          "again — which is what makes re-opening it start from " +
          "`#ffffff`/`solid`/`1` rather than from whatever was last set. " +
          "Set a red dashed 3px border, remove the group, add it back.",
      },
    },
  },
} satisfies Meta<typeof Border>;

export default meta;
type Story = StoryObj<typeof meta>;

// `kbrd.render-key`'s own manifest, which is the whole of that plugin's
// config — see `render-key/plugin.json`.
const DEFAULTS: BorderConfig = {
  borderEnabled: false,
  borderColor: "#ffffff",
  borderStyle: "solid",
  borderWidth: 1,
};

export const Off: Story = {
  args: { config: DEFAULTS, stored: {}, onChange: () => {} },
  render: () => (
    <BlockHarness<BorderConfig> defaults={DEFAULTS}>
      {(props) => <Border {...props} />}
    </BlockHarness>
  ),
};

/** Switched on and given a look of its own. */
export const On: Story = {
  ...Off,
  render: () => (
    <BlockHarness<BorderConfig>
      defaults={DEFAULTS}
      initialStored={{
        borderEnabled: true,
        borderColor: "#00ff00",
        borderStyle: "dashed",
        borderWidth: 2,
      }}
    >
      {(props) => <Border {...props} />}
    </BlockHarness>
  ),
};

export const Disabled: Story = {
  ...Off,
  render: () => (
    <BlockHarness<BorderConfig>
      defaults={DEFAULTS}
      initialStored={{ borderEnabled: true }}
    >
      {(props) => <Border {...props} disabled />}
    </BlockHarness>
  ),
};
