import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import MappingEditor from "./MappingEditor";
import type { WebsiteConfig } from "./index";
import manifest from "../plugin.json";
import { Controlled } from "../../shared/web/stories/harness";

const meta = {
  title: "Plugins/invoke-website/MappingEditor",
  component: MappingEditor,
  parameters: {
    docs: {
      description: {
        component:
          "A URL and, optionally, which browser opens it. The browser " +
          "list comes from `GET /api/browsers`, which KBRD-API proxies " +
          "to whichever agent is currently registered — so on a real " +
          "install it's empty until a machine has paired. The two " +
          "offered here are the Storybook stub's.",
      },
    },
  },
} satisfies Meta<typeof MappingEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS = manifest.defaultConfig as WebsiteConfig;

const render = (initial: WebsiteConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={360}>
        <Controlled<WebsiteConfig> initial={initial}>
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

/** Empty URL, no browser — whatever the machine's default is. */
export const Fresh: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

export const Configured: Story = {
  ...Fresh,
  render: render({ url: "https://kbrd.dev", browserId: "firefox" }),
};

export const Disabled: Story = {
  ...Fresh,
  render: render({ url: "https://kbrd.dev", browserId: "chromium" }, true),
};
