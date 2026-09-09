import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import MappingEditor from "./MappingEditor";
import type { LayoutConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-layout/MappingEditor",
  component: MappingEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Which layout — and, within it, which layer — the key switches " +
          "to, and on which half of its own press.\n\n" +
          "Both lists come from KBRD-API (`GET /api/layout`, `GET " +
          "/api/layer`) rather than from the host, so this editor is one " +
          "of the few that fetches for itself. The two layouts and three " +
          "layers offered here are the Storybook stub's — see " +
          "`.storybook/api-stub.ts`.",
      },
    },
  },
} satisfies Meta<typeof MappingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as LayoutConfig;

const render = (initial: LayoutConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={360}>
        <Controlled<LayoutConfig> initial={initial}>
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

/** Nothing picked yet — both ids `null`, as the manifest defaults them. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

/** A layout chosen, which is what narrows the layer list to its own. */
export const LayoutChosen: Story = {
  ...Fresh,
  render: render({ layoutId: 1, layerId: null, event: "down" }),
};

/** Both picked, firing on release instead of on press. */
export const Configured: Story = {
  ...Fresh,
  render: render({ layoutId: 2, layerId: 3, event: "up" }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ layoutId: 1, layerId: 2, event: "down" }, true),
};
