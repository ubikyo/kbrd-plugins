import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { VideoConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-video/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "One field: the video itself. Same upload path as " +
          "`render-image` — the file goes to `/api/media` on pick and " +
          "the config keeps the name that comes back. Whether it may " +
          "spill outside the key is a *Layout* property, so it lives in " +
          "this plugin's `LayoutEditor` instead.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as unknown as VideoConfig;

const render = (initial: VideoConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={360}>
        <Controlled<VideoConfig> initial={initial}>
          {(config, onChange) => (
            <LayerEditor
              config={config}
              onChange={onChange}
              disabled={disabled}
            />
          )}
        </Controlled>
      </Box>
    );
  };

export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

export const Chosen: Story = {
  ...Fresh,
  render: render({
    ...DEFAULTS,
    media: "9b8a7c6d5e4f3a2b1c0d9e8f7a6b5c4d.webm",
    name: "loading.webm",
  }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ ...DEFAULTS, media: "a.webm", name: "loading.webm" }, true),
};
