import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { WebsiteConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-website/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Opening a page is one thing, so this editor is the one block " +
          "that says it: which address, and which browser opens it.\n\n" +
          "An *optional* group (see `PropertyGroup`), like every block " +
          "in `shared/web/blocks`: a key carries as many actions as it " +
          "is given — several of the same kind included, each one its " +
          "own instance, run top to bottom in the order the Properties " +
          "list shows them — so no single instance is the key's one " +
          "behaviour, and closing the group hands its fields back to the " +
          "manifest's `defaultConfig` for the state being edited.\n\n" +
          "The browser list comes from `GET /api/browsers`, which " +
          "KBRD-API proxies to whichever agent is currently registered — " +
          "so on a real install it's empty until a machine has paired. " +
          "The three offered here are the Storybook stub's.\n\n" +
          "Each entry carries its own `isDefault`: the agent reports " +
          "which browser the machine itself opens a link with, and a " +
          "fresh group takes that one rather than asking for an answer " +
          "the machine already has.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The plugin's own manifest, exactly as the host merges it — no story
// literal to drift from `plugin.json`.
const DEFAULTS = manifest.defaultConfig as unknown as WebsiteConfig;

/** A fresh instance: the group closed, nothing stored — this state says
 * nothing, and the step does nothing. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: () => (
    <BlockHarness<WebsiteConfig> defaults={DEFAULTS}>
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

/** Just added: `url` is stored as the empty string, which is what keeps
 * the group open while the address still asks. The browser doesn't ask —
 * it takes the machine's own default (Safari, from the stub above) as
 * soon as the list lands, since that's the browser the link would have
 * opened in anyway. */
export const Added: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<WebsiteConfig>
      defaults={DEFAULTS}
      initialStored={{ url: "", browserId: null }}
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
    <BlockHarness<WebsiteConfig>
      defaults={DEFAULTS}
      initialStored={{ url: "https://kbrd.dev", browserId: "firefox" }}
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
    <BlockHarness<WebsiteConfig>
      defaults={DEFAULTS}
      initialStored={{ url: "https://kbrd.dev", browserId: "chromium" }}
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
