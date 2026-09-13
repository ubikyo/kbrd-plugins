import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { ApplicationConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-application/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Launching an application is one thing, so this editor is the " +
          "one block that says it: which application, and whether " +
          "holding the key quits it instead.\n\n" +
          "An *optional* group (see `PropertyGroup`), like every block " +
          "in `shared/web/blocks`: a key carries as many actions as it " +
          "is given — several of the same kind included, each one its " +
          "own instance, run top to bottom in the order the Properties " +
          "list shows them — so no single instance is the key's one " +
          "behaviour, and closing the group hands its fields back to the " +
          "manifest's `defaultConfig` for the state being edited.\n\n" +
          "The list comes from `GET /api/applications`, proxied to the " +
          "registered agent — each entry carrying its own `canQuit`, " +
          "since not every application can be asked to quit. The three " +
          "here are the Storybook stub's, one of which can't; the " +
          "long-press answer is greyed out for that one, which is the " +
          "whole of what the panel says about it.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The plugin's own manifest, exactly as the host merges it — no story
// literal to drift from `plugin.json`.
const DEFAULTS = manifest.defaultConfig as unknown as ApplicationConfig;

/** A fresh instance: the group closed, nothing stored — this state says
 * nothing, and the step does nothing. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: () => (
    <BlockHarness<ApplicationConfig> defaults={DEFAULTS}>
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

/** Just added, with `applicationId` stored as `null`: the group doesn't
 * stay on its placeholder waiting to be answered — it takes the first
 * application the list offers (Firefox, from the stub above) as soon as
 * that list lands, so the step launches something the moment it's open.
 * `null` is only what's shown while the list is still on its way, or has
 * nothing in it at all. */
export const Added: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<ApplicationConfig>
      defaults={DEFAULTS}
      initialStored={{ applicationId: null, quitOnLongPress: false }}
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

export const Configured: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<ApplicationConfig>
      defaults={DEFAULTS}
      initialStored={{ applicationId: "firefox", quitOnLongPress: true }}
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

/** GIMP, which the stub marks `canQuit: false` — the long-press answer
 * has nothing to offer for it, so the question is greyed out with it. */
export const CannotQuit: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<ApplicationConfig>
      defaults={DEFAULTS}
      initialStored={{ applicationId: "gimp", quitOnLongPress: false }}
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
    <BlockHarness<ApplicationConfig>
      defaults={DEFAULTS}
      initialStored={{ applicationId: "code", quitOnLongPress: false }}
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
