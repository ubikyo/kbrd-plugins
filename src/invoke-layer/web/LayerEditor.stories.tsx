import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { LayerConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-layer/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Switching to a layer is one thing, so this editor is the one " +
          "block that says it: which layer, and on which half of the " +
          "key's own press.\n\n" +
          "An *optional* group (see `PropertyGroup`), like every block " +
          "in `shared/web/blocks`: a key carries as many actions as it " +
          "is given — several of the same kind included, each one its " +
          "own instance, run top to bottom in the order the Properties " +
          "list shows them — so no single instance is the key's one " +
          "behaviour, and closing the group hands its fields back to the " +
          "manifest's `defaultConfig` for the state being edited. The " +
          "layer list comes from the Storybook API stub here.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The plugin's own manifest, exactly as the host merges it — no story
// literal to drift from `plugin.json`.
const DEFAULTS = manifest.defaultConfig as unknown as LayerConfig;

/** A fresh instance: the group closed, nothing stored — this state says
 * nothing, and the step does nothing. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: () => (
    <BlockHarness<LayerConfig> defaults={DEFAULTS}>
      {({ config, stored, onChange }) => (
        <LayerEditor
          config={config}
          definedConfig={stored}
          onChange={onChange}
        />
      )}
    </BlockHarness>
  ),
};

/** Added but not yet answered: `layerId` is stored as `null`, which is
 * what keeps the group open while the select still asks for a layer. */
export const Added: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<LayerConfig>
      defaults={DEFAULTS}
      initialStored={{ layerId: null, event: "down" }}
    >
      {({ config, stored, onChange }) => (
        <LayerEditor
          config={config}
          definedConfig={stored}
          onChange={onChange}
        />
      )}
    </BlockHarness>
  ),
};

/** Held: switches on press, which is what a momentary Fn layer wants. */
export const OnPress: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<LayerConfig>
      defaults={DEFAULTS}
      initialStored={{ layerId: 2, event: "down" }}
    >
      {({ config, stored, onChange }) => (
        <LayerEditor
          config={config}
          definedConfig={stored}
          onChange={onChange}
        />
      )}
    </BlockHarness>
  ),
};

export const OnRelease: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<LayerConfig>
      defaults={DEFAULTS}
      initialStored={{ layerId: 3, event: "up" }}
    >
      {({ config, stored, onChange }) => (
        <LayerEditor
          config={config}
          definedConfig={stored}
          onChange={onChange}
        />
      )}
    </BlockHarness>
  ),
};

export const Disabled: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<LayerConfig>
      defaults={DEFAULTS}
      initialStored={{ layerId: 1, event: "down" }}
    >
      {({ config, stored, onChange }) => (
        <LayerEditor
          config={config}
          definedConfig={stored}
          onChange={onChange}
          disabled
        />
      )}
    </BlockHarness>
  ),
};
