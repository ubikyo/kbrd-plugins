import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import LayoutEditor from "./LayoutEditor";
import type { LayoutKeyConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/layout-key/LayoutEditor",
  component: LayoutEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Whether a key is momentary (active only while held) or a " +
          "toggle. Moved here from `<Inspector>`'s hardcoded system " +
          "properties: it's a Key-element property like any other now, " +
          "edited through this plugin rather than by the host.",
      },
    },
  },
} satisfies Meta<typeof LayoutEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as LayoutKeyConfig;

const render = (initial: LayoutKeyConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={340}>
        <Controlled<LayoutKeyConfig> initial={initial}>
          {(config, onChange) => (
            <LayoutEditor
              config={config}
              onChange={onChange}
              disabled={disabled}
            />
          )}
        </Controlled>
      </Box>
    );
  };

/** The default: active only while the key is held. */
export const Momentary: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

export const Toggle: Story = {
  ...Momentary,
  render: render({ keyMode: "toggle" }),
};

export const Disabled: Story = {
  ...Momentary,
  render: render(DEFAULTS, true),
};
