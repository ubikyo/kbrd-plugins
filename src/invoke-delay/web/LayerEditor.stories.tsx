import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { DelayConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-delay/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Waiting is one thing, so this editor is the one block that " +
          "says it: how long, and in what.\n\n" +
          "A key carries as many actions as it is given, run top to " +
          "bottom in the order the Properties list shows them, so a " +
          "delay is a step like any other — it just holds the ones " +
          "after it back rather than doing something of its own. Which " +
          "is why it has no on-press/on-release question the way " +
          "`invoke-layer` does: the wait happens where the step sits, " +
          "and moving it by its grip is what moves the wait.\n\n" +
          "An *optional* group (see `PropertyGroup`), like every block " +
          "in `shared/web/blocks`: closing it hands both fields back to " +
          "the manifest's `defaultConfig` for the state being edited. " +
          "The duration itself is required while the group is open — it " +
          "can't be left empty, and a config that arrives without one is " +
          "told so rather than quietly shown the default.\n\n" +
          "Needs nothing from KBRD-API: the whole of its state is the " +
          "config it's handed.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The plugin's own manifest, exactly as the host merges it — no story
// literal to drift from `plugin.json`.
const DEFAULTS = manifest.defaultConfig as unknown as DelayConfig;

/** A fresh instance: the group closed, nothing stored — this state says
 * nothing, and the step does nothing. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: () => (
    <BlockHarness<DelayConfig> defaults={DEFAULTS}>
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

/** Just added: 200 ms, the manifest's own default — the step waits
 * something the moment it's open, rather than sitting on an empty field
 * waiting to be answered. */
export const Added: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<DelayConfig>
      defaults={DEFAULTS}
      initialStored={{ delay: 200, delayUnit: "ms" }}
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

/** Another unit: the number is the number, and the dropdown beside it is
 * what says how long that is. */
export const Seconds: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<DelayConfig>
      defaults={DEFAULTS}
      initialStored={{ delay: 3, delayUnit: "s" }}
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

/** A config that arrived with a unit but no duration — the one state the
 * required field has anything to say about. */
export const Missing: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<DelayConfig>
      defaults={DEFAULTS}
      initialStored={{ delay: null as unknown as number, delayUnit: "s" }}
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
    <BlockHarness<DelayConfig>
      defaults={DEFAULTS}
      initialStored={{ delay: 500, delayUnit: "ms" }}
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
