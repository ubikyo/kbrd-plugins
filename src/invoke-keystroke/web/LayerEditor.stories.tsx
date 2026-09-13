import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { KeystrokeConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-keystroke/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Sending a combination is one thing, so this editor is the one " +
          "block that says it: which keys, and whether they're held for " +
          "as long as the key is down or tapped for a fixed duration.\n\n" +
          "An *optional* group (see `PropertyGroup`), like every block " +
          "in `shared/web/blocks`: a key carries as many actions as it " +
          "is given — several of the same kind included, each one its " +
          "own instance, run top to bottom in the order the Properties " +
          "list shows them — so no single instance is the key's one " +
          "behaviour, and closing the group hands its fields back to the " +
          "manifest's `defaultConfig` for the state being edited.\n\n" +
          "Needs nothing from KBRD-API: the keys a HID report can carry " +
          "are the same everywhere, so `Action` states them rather than " +
          "fetching them. Unlike the application and browser lists, that " +
          "leaves no first answer worth seeding either — a fresh group " +
          "opens on its own error and says what it wants.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The plugin's own manifest, exactly as the host merges it — no story
// literal to drift from `plugin.json`.
const DEFAULTS = manifest.defaultConfig as unknown as KeystrokeConfig;

/** A fresh instance: the group closed, nothing stored — this state says
 * nothing, and the step does nothing. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: () => (
    <BlockHarness<KeystrokeConfig> defaults={DEFAULTS}>
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

/** Just added, with `keys` stored as the empty array: there is no "first
 * key" that would be the obvious answer, so the group opens on its own
 * error rather than seeding a combination on the reader's behalf. */
export const Added: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<KeystrokeConfig>
      defaults={DEFAULTS}
      initialStored={{ keys: [], behavior: "hold", durationMs: 50 }}
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

/** A modifier combination, held for as long as the key is down — so the
 * duration has nothing to say and isn't asked about. */
export const Combination: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<KeystrokeConfig>
      defaults={DEFAULTS}
      initialStored={{
        keys: ["LEFT_CTRL", "LEFT_SHIFT", "P"],
        behavior: "hold",
        durationMs: 50,
      }}
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

/** Tapped instead: sent for `durationMs` and released, however long the
 * key itself stays down — which is the one behaviour the duration field
 * shows for. */
export const Tap: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<KeystrokeConfig>
      defaults={DEFAULTS}
      initialStored={{ keys: ["ENTER"], behavior: "tap", durationMs: 120 }}
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
    <BlockHarness<KeystrokeConfig>
      defaults={DEFAULTS}
      initialStored={{
        keys: ["LEFT_CTRL", "C"],
        behavior: "tap",
        durationMs: 50,
      }}
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
