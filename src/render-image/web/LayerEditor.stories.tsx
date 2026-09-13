import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import MappingEditor from "./MappingEditor";
import type { ImageConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-image/MappingEditor",
  component: MappingEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Pick a file, and it's uploaded straight away — the config " +
          "stores the name KBRD-API hands back, not the file. The size " +
          "slider only appears once \"Fill the entire element\" is off, " +
          "since a full-size image has no size to choose.\n\n" +
          "Picking a file here really does POST to `/api/media`; the " +
          "Storybook stub answers with a plausible filename and stores " +
          "nothing.",
      },
    },
  },
} satisfies Meta<typeof MappingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as unknown as ImageConfig;

const render = (initial: ImageConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={360}>
        <Controlled<ImageConfig> initial={initial}>
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

/** Nothing uploaded yet. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

/** A file chosen, filling the element — so no size row. */
export const FullSize: Story = {
  ...Fresh,
  render: render({
    ...DEFAULTS,
    media: "4f1c9e7a2b0d4e5f8a1b2c3d4e5f6a7b.png",
    name: "logo.png",
    fullSize: true,
  }),
};

/** Not full size, which is what brings the size slider out. */
export const Sized: Story = {
  ...Fresh,
  render: render({
    ...DEFAULTS,
    media: "4f1c9e7a2b0d4e5f8a1b2c3d4e5f6a7b.png",
    name: "logo.png",
    fullSize: false,
    size: 50,
  }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ ...DEFAULTS, media: "a.png", name: "logo.png" }, true),
};
