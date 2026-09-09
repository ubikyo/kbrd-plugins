import type { Meta, StoryObj } from "@storybook/react-vite";

import Background, {
  DEFAULT_BACKGROUND_COLOR,
  type BackgroundConfig,
} from "./Background";
import { BlockHarness } from "../stories/harness";

const meta = {
  title: "Blocks/Background",
  component: Background,
  parameters: {
    docs: {
      description: {
        component:
          "The element's own fill — one colour, with the opacity that " +
          "makes a background worth having.\n\n" +
          "`backgroundColor` is optional in the real sense: absent means " +
          "the property genuinely isn't set, not \"set to transparent\". " +
          "That's why it can't live in a manifest's `defaultConfig`, " +
          "where a value would make the group always present and so " +
          "always open. `+` seeds " +
          "`" + DEFAULT_BACKGROUND_COLOR + "` — white at 50%, visible " +
          "enough that adding the property clearly did something, faint " +
          "enough not to hide whatever else the element draws.",
      },
    },
  },
} satisfies Meta<typeof Background>;

export default meta;
type Story = StoryObj<typeof meta>;

// No manifest defaults a background — see the block's own doc — so the
// merged view starts empty too.
const DEFAULTS: BackgroundConfig = {};

/** Not set: the group is closed and `stored` carries nothing. Press `+`. */
export const Unset: Story = {
  args: { config: DEFAULTS, stored: {}, onChange: () => {} },
  render: () => (
    <BlockHarness<BackgroundConfig> defaults={DEFAULTS}>
      {(props) => <Background {...props} />}
    </BlockHarness>
  ),
};

/** Already set — an instance loaded with a background of its own. */
export const Set: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<BackgroundConfig>
      defaults={DEFAULTS}
      initialStored={{ backgroundColor: "#00ff0040" }}
    >
      {(props) => <Background {...props} />}
    </BlockHarness>
  ),
};

export const Disabled: Story = {
  ...Unset,
  render: () => (
    <BlockHarness<BackgroundConfig>
      defaults={DEFAULTS}
      initialStored={{ backgroundColor: DEFAULT_BACKGROUND_COLOR }}
    >
      {(props) => <Background {...props} disabled />}
    </BlockHarness>
  ),
};
