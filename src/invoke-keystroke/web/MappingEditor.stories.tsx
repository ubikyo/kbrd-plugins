import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import MappingEditor from "./MappingEditor";
import type { KeystrokeConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-keystroke/MappingEditor",
  component: MappingEditor,
  parameters: {
    docs: {
      description: {
        component:
          "The keystroke the key sends: which keys, and whether they're " +
          "held for as long as the key is down or tapped for a fixed " +
          "duration. Needs nothing from KBRD-API — the whole of its " +
          "state is the config it's handed.",
      },
    },
  },
} satisfies Meta<typeof MappingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as KeystrokeConfig;

const render = (initial: KeystrokeConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={360}>
        <Controlled<KeystrokeConfig> initial={initial}>
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

/** No keys yet. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

/** A modifier combination, held for as long as the key is down. */
export const Combination: Story = {
  ...Fresh,
  render: render({ keys: ["ctrl", "shift", "p"], behavior: "hold", durationMs: 50 }),
};

/** Tapped instead: sent for `durationMs` and released, however long the
 * key itself stays down. */
export const Tap: Story = {
  ...Fresh,
  render: render({ keys: ["enter"], behavior: "tap", durationMs: 120 }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ keys: ["ctrl", "c"], behavior: "hold", durationMs: 50 }, true),
};
