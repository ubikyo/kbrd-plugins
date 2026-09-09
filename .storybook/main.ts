import type { StorybookConfig } from "@storybook/react-vite";

/**
 * KBRD-PLUGINS' own Storybook: the shared control library (`ux/`), the
 * property blocks built out of it (`blocks/`), and each plugin's own
 * editors — every React surface this package publishes, mounted without
 * KBRD-WEB, its API, or a keyboard attached.
 *
 * Vite-based rather than Webpack because that's what KBRD-WEB builds with
 * too (`kbrd-web/vite.config.ts`): same resolver, same JSX transform, so a
 * story that renders here renders the same way in the app.
 */
const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // Nothing about an internal component library is worth phoning home
  // about, and a build shouldn't need the network to succeed.
  core: { disableTelemetry: true },
  viteFinal: (config) => {
    // The same dedupe KBRD-WEB's own Vite config carries. This package
    // keeps React and Mantine as devDependencies *and* peerDependencies,
    // so without it a story can end up with two copies of React — the
    // hooks in `PropertyGroup`/`NumberField` throw the moment that
    // happens.
    config.resolve = {
      ...config.resolve,
      dedupe: ["@mantine/core", "react", "react-dom"],
    };
    return config;
  },
};

export default config;
