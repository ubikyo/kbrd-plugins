import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import LayoutEditor from "./LayoutEditor";
import type { VideoConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-video/LayoutEditor",
  component: LayoutEditor,
  parameters: {
    docs: {
      description: {
        component:
          "One switch: whether the video may spill outside the key " +
          "rather than be clipped to it. The only Layout editor here " +
          "that reads `targetType` — the option is meaningless anywhere " +
          "but on a key, so on a background or a space it says so " +
          "instead.",
      },
    },
  },
} satisfies Meta<typeof LayoutEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as unknown as VideoConfig;

const render = (
  initial: VideoConfig,
  targetType: "key" | "background" | "space" | undefined = "key",
  disabled = false,
) =>
  function Render() {
    return (
      <Box w={340}>
        <Controlled<VideoConfig> initial={initial}>
          {(config, onChange) => (
            <LayoutEditor
              config={config}
              onChange={onChange}
              targetType={targetType}
              disabled={disabled}
            />
          )}
        </Controlled>
      </Box>
    );
  };

export const OnAKey: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

export const Unconstrained: Story = {
  ...OnAKey,
  render: render({ ...DEFAULTS, unconstrained: true }),
};

/** On a background or a space, where the option means nothing. */
export const OnABackground: Story = {
  ...OnAKey,
  render: render(DEFAULTS, "background"),
};

export const Disabled: Story = {
  ...OnAKey,
  render: render(DEFAULTS, "key", true),
};
