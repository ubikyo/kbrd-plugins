import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import LayerEditor from "./LayerEditor";
import type { KeySymbolConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/render-key-symbol/LayerEditor",
  component: LayerEditor,
  parameters: {
    docs: {
      description: {
        component:
          "A label whose text is picked from the glyphs a keycap " +
          "actually carries (⏎, ⇧, ⌫ …) rather than typed. It loads the " +
          "font files themselves to preview each one, which is why it " +
          "keeps its own `/api/fonts` cache next to the shared " +
          "`Typography` block's rather than reusing it.\n\n" +
          "Storybook's stub answers the font *list*, but not the font " +
          "*files* — the glyph previews here fall back to whatever the " +
          "browser has.",
      },
    },
  },
} satisfies Meta<typeof LayerEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as unknown as KeySymbolConfig;

const render = (initial: KeySymbolConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={360}>
        <Controlled<KeySymbolConfig> initial={initial}>
          {(config, onChange) => (
            <LayerEditor
              config={config}
              onChange={onChange}
              disabled={disabled}
            />
          )}
        </Controlled>
      </Box>
    );
  };

/** The manifest's own default: a return arrow at the named `md` step. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

/** Another glyph, larger and in green. */
export const Configured: Story = {
  ...Fresh,
  render: render({ ...DEFAULTS, text: "⇧", size: 10, color: "#00ff00" }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render(DEFAULTS, true),
};
