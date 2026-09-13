import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { RenderKeyConfig } from "./index";
import manifest from "../plugin.json";
import { BlockHarness } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-key/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "The Key/Space/Layer element's own look for the active state — " +
          "a fill and an outline, and nothing else: this plugin *is* the " +
          "element's form, so those two blocks are the whole of it.\n\n" +
          "Both are genuinely optional, and `PropertyGroup`'s `+`/`×` is " +
          "what adds or removes each from the state's config; there's no " +
          "separate \"enabled\" switch behind either. The plugin is " +
          "`deletable: false` in its manifest — it isn't something a " +
          "user attaches, so it never appears in the Plugins tab's " +
          "draggable list.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as unknown as RenderKeyConfig;

const render = (initialStored: Partial<RenderKeyConfig>, disabled = false) =>
  function Render() {
    return (
      <BlockHarness<RenderKeyConfig>
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

/** The state a key is in before anyone styles it: the renderer's own
 * default look. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render({}),
};

/** A pressed state, say: filled green and ringed in white. */
export const Styled: Story = {
  ...Fresh,
  render: render({
    backgroundColor: "#00ff0060",
    borderEnabled: true,
    borderColor: "#ffffff",
    borderStyle: "solid",
    borderWidth: 2,
  }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ backgroundColor: "#ffffff80" }, true),
};
