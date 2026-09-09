import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import LayoutEditor from "./LayoutEditor";
import type { ImageConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-image/LayoutEditor",
  component: LayoutEditor,
  parameters: {
    docs: {
      description: {
        component:
          "`Placement` (see `Shared/Placement`), with one thing of its " +
          "own: a full-size image fills the element, so there is no " +
          "placement left to configure and the editor says so instead of " +
          "showing a grid that would do nothing.\n\n" +
          "`render-label`'s and `render-rectangle`'s own Layout editors " +
          "are `Placement` and nothing else, which is why they have no " +
          "story of their own — `Shared/Placement` already is it.",
      },
    },
  },
} satisfies Meta<typeof LayoutEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as unknown as ImageConfig;

const render = (initial: ImageConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={340}>
        <Controlled<ImageConfig> initial={initial}>
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

/** The manifest's own default is `fullSize: true` — nothing to place. */
export const FullSize: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

/** Not full size, so the placement grid comes back. */
export const Placed: Story = {
  ...FullSize,
  render: render({ ...DEFAULTS, fullSize: false }),
};

export const Disabled: Story = {
  ...FullSize,
  render: render({ ...DEFAULTS, fullSize: false }, true),
};
