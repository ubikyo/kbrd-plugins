import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { RectangleConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-rectangle/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "A rectangle is a filled, outlined box of some size somewhere " +
          "in a cell, so its editor is the four shared blocks that say " +
          "exactly those things: `Position` where it goes, `Dimension` " +
          "how big it is, `Background` what fills it, `Border` what " +
          "outlines it. The widest use of the block library there is — " +
          "the whole editor is composition, with no control of its own.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as unknown as RectangleConfig;

const render = (
  initialStored: Partial<RectangleConfig>,
  disabled = false,
) =>
  function Render() {
    return (
      <BlockHarness<RectangleConfig>
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

/** All four groups closed — every one of them optional in its own right. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render({}),
};

/** A green 80%-square outlined in white, placed bottom-right. */
export const Configured: Story = {
  ...Fresh,
  render: render({
    precisePlacement: true,
    positionUnit: "%",
    x: 100,
    y: 100,
    anchor: "bottom-right",
    dimensionUnit: "%",
    width: 80,
    height: 80,
    lockRatio: true,
    backgroundColor: "#00ff0040",
    borderEnabled: true,
    borderColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 2,
  }),
};

/**
 * An instance saved before the Background block existed: the fill lives
 * in `color`, which nothing writes any more and the renderers still fall
 * back to. The Background group reads as unset, because it is.
 */
export const LegacyColor: Story = {
  ...Fresh,
  render: render({ color: "#ff0055" }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ backgroundColor: "#ffffff80", borderEnabled: true }, true),
};
