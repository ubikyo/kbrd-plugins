import { Box } from "@mantine/core";
import type { Meta, StoryObj } from "@storybook/react-vite";

import Placement, { type PlacementConfig } from "./Placement";
import { Controlled } from "./stories/harness";

const meta = {
  title: "Shared/Placement",
  component: Placement,
  parameters: {
    docs: {
      description: {
        component:
          "The Layout editor's own placement control: a nine-way grid " +
          "saying where a box sits *on the element*, or — with \"Precise " +
          "placement\" on — a pair of 0-100 sliders instead.\n\n" +
          "Not to be confused with `AnchorGrid`, which says which point " +
          "*of the box* a coordinate pair addresses. The two are " +
          "complementary, and only `AnchorGrid` is of any use once " +
          "explicit coordinates are in play — which is why the `Position` " +
          "block, the Mapping-side control, carries that one and not this.",
      },
    },
  },
} satisfies Meta<typeof Placement>;

export default meta;
type Story = StoryObj<typeof meta>;

const DEFAULTS: PlacementConfig = {
  precisePlacement: false,
  x: 50,
  y: 50,
  verticalPosition: "middle",
  horizontalPosition: "center",
};

const render = (initial: PlacementConfig, disabled = false) =>
  function Render() {
    return (
      <Box w={340}>
        <Controlled<PlacementConfig> initial={initial}>
          {(config, onChange) => (
            <Placement
              config={config}
              onChange={onChange}
              disabled={disabled}
            />
          )}
        </Controlled>
      </Box>
    );
  };

/** The nine-way grid — switch "Precise placement" on to swap it for the
 * sliders. */
export const Grid: Story = {
  args: { config: DEFAULTS, onChange: () => {} },
  render: render(DEFAULTS),
};

/** Already precise: the grid is replaced by the X/Y pair it supersedes. */
export const Precise: Story = {
  ...Grid,
  render: render({ ...DEFAULTS, precisePlacement: true, x: 25, y: 75 }),
};

export const Disabled: Story = {
  ...Grid,
  render: render({ ...DEFAULTS, verticalPosition: "top", horizontalPosition: "right" }, true),
};
