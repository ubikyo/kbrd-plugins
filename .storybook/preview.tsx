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
 * theme, same CSS variables, same forced dark scheme. Every control in
 * `ux/` is styled in terms of `--kbrd-color-body` / `--kbrd-border-color`
 * and draws as an invisible box without it, so this isn't decoration:
 * it's the minimum for a story to show the real component.
 */
const preview: Preview = {
  decorators: [
    (Story) => (
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        forceColorScheme="dark"
      >
        <Story />
      </MantineProvider>
    ),
  ],
  parameters: {
    // The app paints pure black everywhere (`--kbrd-color-body`), and
    // these controls are drawn for that ground — a white canvas would
    // hide every white-on-black border in the library.
    backgrounds: {
      options: {
        kbrd: { name: "KBRD", value: "#000000" },
        surface: { name: "Surface", value: "#222120" },
      },
    },
    controls: { expanded: true },
  },
  initialGlobals: {
    backgrounds: { value: "kbrd" },
  },
};

export default preview;
