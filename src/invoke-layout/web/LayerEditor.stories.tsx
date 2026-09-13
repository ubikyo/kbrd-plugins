import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { LayoutConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-layout/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Which layout — and, within it, which layer — the key switches " +
          "to, and on which half of its own press.\n\n" +
          "The same shape as `invoke-layer`'s own editor (a select and " +
          "the two event glyphs on one row), with the layer select " +
          "underneath, held to the layout select's width rather than the " +
          "whole row's.\n\n" +
          "An *optional* group (see `PropertyGroup`), like every block " +
          "in `shared/web/blocks`: a key carries as many actions as it " +
          "is given — several of the same kind included, each one its " +
          "own instance, run top to bottom in the order the Properties " +
          "list shows them — so no single instance is the key's one " +
          "behaviour, and closing the group hands its fields back to the " +
          "manifest's `defaultConfig` for the state being edited.\n\n" +
          "Both lists come from KBRD-API (`GET /api/layout`, `GET " +
          "/api/layer`) rather than from the host, so this editor is one " +
          "of the few that fetches for itself. The two layouts and three " +
          "layers offered here are the Storybook stub's — see " +
          "`.storybook/api-stub.ts`.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The plugin's own manifest, exactly as the host merges it — no story
// literal to drift from `plugin.json`.
const DEFAULTS = manifest.defaultConfig as unknown as LayoutConfig;

const render = (initialStored?: Partial<LayoutConfig>, disabled = false) =>
  function Render() {
    return (
      <BlockHarness<LayoutConfig>
        defaults={DEFAULTS}
        initialStored={initialStored}
      >
        {({ config, stored, onChange }) => (
          <LayerEditor
            config={config}
            definedConfig={stored}
            onChange={onChange}
            disabled={disabled}
          />
        )}
      </BlockHarness>
    );
  };

/** A fresh instance: the group closed, nothing stored — this state says
 * nothing, and the step does nothing. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(),
};

/** Added: the first layout the list offers is taken straight away, and
 * with it that layout's own first layer — so the step does something the
 * moment the group opens. */
export const Added: Story = {
  ...Fresh,
  render: render({ layoutId: 1, layerId: 1, event: "down" }),
};

/** Another of the chosen layout's layers, picked by hand over the first
 * one it was entered on. */
export const LayerChosen: Story = {
  ...Fresh,
  render: render({ layoutId: 1, layerId: 2, event: "down" }),
};

/** Firing on release instead of on press. */
export const OnRelease: Story = {
  ...Fresh,
  render: render({ layoutId: 2, layerId: 3, event: "up" }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ layoutId: 1, layerId: 2, event: "down" }, true),
};
