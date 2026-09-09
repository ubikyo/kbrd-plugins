import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import MappingEditor from "./MappingEditor";
import type { ApplicationConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-application/MappingEditor",
  component: MappingEditor,
  parameters: {
    docs: {
      description: {
        component:
          "Which application the key launches, and whether holding it " +
          "quits that application instead.\n\n" +
          "The list comes from `GET /api/applications`, proxied to the " +
          "registered agent — each entry carrying its own `canQuit`, " +
          "since not every application can be asked to. The three here " +
          "are the Storybook stub's, one of which can't.",
      },
    },
  },
} satisfies Meta<typeof MappingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as ApplicationConfig;

const render = (initial: ApplicationConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={360}>
        <Controlled<ApplicationConfig> initial={initial}>
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

export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

export const Configured: Story = {
  ...Fresh,
  render: render({ applicationId: "firefox", quitOnLongPress: true }),
};

/** GIMP, which the stub marks `canQuit: false` — the long-press option
 * has nothing to offer for it. */
export const CannotQuit: Story = {
  ...Fresh,
  render: render({ applicationId: "gimp", quitOnLongPress: false }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ applicationId: "code", quitOnLongPress: false }, true),
};
