import type { Meta, StoryObj } from "@storybook/react-vite";

import MappingEditor from "./MappingEditor";
import type { LabelConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-label/MappingEditor",
  component: MappingEditor,
  parameters: {
    docs: {
      description: {
        component:
          "A label is a piece of text placed in a cell, so its editor is " +
          "exactly the two shared blocks that say those two things — " +
          "`Position` and `Typography`. Everything that used to live " +
          "here (the coordinate pair and its unit, the anchor, the " +
          "alignments, the font row, the emphases) moved into them " +
          "unchanged, so `render-rectangle` and anything else needing " +
          "\"where does it go\" gets the same control rather than a " +
          "second copy of it.",
      },
    },
  },
} satisfies Meta<typeof MappingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

// The plugin's own manifest, exactly as the host merges it — no story
// literal to drift from `plugin.json`.
const DEFAULTS = manifest.defaultConfig as unknown as LabelConfig;

/** A fresh instance: both groups closed, nothing stored. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: () => (
    <BlockHarness<LabelConfig> defaults={DEFAULTS}>
      {({ config, stored, onChange }) => (
        <MappingEditor
          config={config}
          definedConfig={stored}
          onChange={onChange}
        />
      )}
    </BlockHarness>
  ),
};

/** A label that has been placed and styled — both groups open, and the
 * stored slice beside it showing exactly which keys that took. */
export const Configured: Story = {
  ...Fresh,
  render: () => (
    <BlockHarness<LabelConfig>
      defaults={DEFAULTS}
      initialStored={{
        precisePlacement: true,
        positionUnit: "%",
        x: 50,
        y: 100,
        anchor: "bottom-center",
        text: "Shift",
        size: 6,
        color: "#00ff00",
        bold: true,
      }}
    >
      {({ config, stored, onChange }) => (
        <MappingEditor
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
    <BlockHarness<LabelConfig>
      defaults={DEFAULTS}
      initialStored={{ text: "Shift", precisePlacement: true }}
    >
      {({ config, stored, onChange }) => (
        <MappingEditor
          config={config}
          definedConfig={stored}
          onChange={onChange}
          disabled
        />
      )}
    </BlockHarness>
  ),
};
