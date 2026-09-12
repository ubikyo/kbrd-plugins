import { MantineProvider } from "@mantine/core";
import type { Preview } from "@storybook/react-vite";

import { cssVariablesResolver, theme } from "../src/shared/web/theme";
import { installApiStub } from "./api-stub";

import "@mantine/core/styles.css";

// Before any story mounts: several editors fetch their own options from
// KBRD-API, which isn't there. See `api-stub.ts`.
installApiStub();

/**
 * The same provider `kbrd-web/src/main.tsx` wraps the app in — same
 * theme, same CSS variables. Every control in `ux/` is styled in terms
 * of `--kbrd-color-body` / `--kbrd-border-color` and draws as an
 * invisible box without it, so this isn't decoration: it's the minimum
 * for a story to show the real component.
 *
 * The scheme is a toolbar switch rather than the app's own `auto`: a
 * story is there to be *looked at*, and both palettes have to be
 * reachable on demand (see `src/shared/web/themes/`) — including on a
 * machine whose OS is set to the other one. The canvas background
 * follows it, since every one of these controls is drawn for the ground
 * its own theme paints.
 */
const preview: Preview = {
  globalTypes: {
    scheme: {
      description: "Which KBRD palette the controls are drawn in",
      toolbar: {
        title: "Theme",
        icon: "contrast",
        items: [
          { value: "dark", title: "Dark" },
          { value: "light", title: "Light" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    scheme: "dark",
  },
  decorators: [
    (Story, context) => {
      const scheme = context.globals.scheme === "light" ? "light" : "dark";
      return (
        <MantineProvider
          theme={theme}
          cssVariablesResolver={cssVariablesResolver}
          forceColorScheme={scheme}
        >
          {/* The provider paints `--kbrd-color-body` onto the variables,
              not onto the page — Storybook's own canvas is what's
              actually behind a story, so the ground is set here. */}
          <div
            style={{
              background: "var(--kbrd-color-body)",
              color: "var(--kbrd-color-text)",
              padding: 16,
            }}
          >
            <Story />
          </div>
        </MantineProvider>
      );
    },
  ],
  parameters: {
    controls: { expanded: true },
  },
};

export default preview;
