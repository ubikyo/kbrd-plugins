import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import MappingEditor from "./MappingEditor";
import type { LayerConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-layer/MappingEditor",
  component: MappingEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Switching to a layer is one thing, so this editor is the one " +
          "block that says it: which layer, and on which half of the " +
          "key's own press.\n\n" +
          "A *permanent* group (see `PropertyGroup`) — no `+`/`×`, " +
          "content always on show — because it isn't an optional extra " +
          "over the plugin, it's the whole of why the instance is " +
          "attached at all. The layer list comes from the Storybook API " +
          "stub here.",
      },
    },
  },
} satisfies Meta<typeof MappingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as LayerConfig;

const render = (initial: LayerConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={340}>
        <Controlled<LayerConfig> initial={initial}>
          {(config, onChange) => (
            <MappingEditor
              config={config}
              onChange={onChange}
              disabled={disabled}
            />
          )}
        </Controlled>
      </Box>
    );
  };

/** No layer picked yet. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

/** Held: switches on press, which is what a momentary Fn layer wants. */
export const OnPress: Story = {
  ...Fresh,
  render: render({ layerId: 2, event: "down" }),
};

export const OnRelease: Story = {
  ...Fresh,
  render: render({ layerId: 3, event: "up" }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ layerId: 1, event: "down" }, true),
};
