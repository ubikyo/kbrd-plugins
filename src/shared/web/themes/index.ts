/**
 * The app's Mantine theme, and the two palettes behind the CSS custom
 * properties every shared control here reads (`--kbrd-color-body`,
 * `--kbrd-border-color`, ...).
 *
 * It lives beside those controls rather than in KBRD-WEB, which is where
 * it started: `ux/` and `blocks/` are styled entirely in terms of these
 * variables, so anything mounting them — the app itself, and Storybook —
 * has to install the same theme or get unstyled boxes. One copy,
 * imported by both (`@kbrd/plugins/theme`), is what keeps the stories
 * showing the controls as the app actually draws them.
 *
 * Which of the two palettes is in force is Mantine's own colour scheme:
 * `cssVariablesResolver` hands the dark one to
 * `[data-mantine-color-scheme="dark"]` and the light one to `light`, and
 * `MantineProvider`'s `defaultColorScheme="auto"` follows the OS until
 * Settings' Appearance tab says otherwise. Nothing reads the scheme
 * itself to pick a colour — every component names a role and gets
 * whichever value is mounted (see `palette.ts`).
 */
import {
  createTheme,
  type CSSVariablesResolver,
  HoverCard,
  Kbd,
  Menu,
  Modal,
  NumberInput,
  Splitter,
  Tabs,
} from "@mantine/core";

import { darkPalette } from "./dark";
import { lightPalette } from "./light";

export { darkPalette } from "./dark";
export { lightPalette } from "./light";
export type { KbrdPalette } from "./palette";

export const theme = createTheme({
  // Mantine's default `:focus-visible` style draws a 2px outline around
  // interactive elements; the app doesn't want that ring.
  focusRing: "never",
  components: {
    NumberInput: NumberInput.extend({
      styles: {
        control: { "--control-border": "none" },
      },
    }),
    Tabs: Tabs.extend({
      vars: () => ({
        root: { "--tabs-color": "var(--kbrd-color-contrast)" },
      }),
    }),
    Modal: Modal.extend({
      styles: {
        content: {
          backgroundColor: "var(--kbrd-color-body)",
          border: "1px solid var(--kbrd-border-color)",
        },
        header: { backgroundColor: "var(--kbrd-color-body)" },
        body: { backgroundColor: "var(--kbrd-color-body)" },
      },
    }),
    Menu: Menu.extend({
      styles: {
        dropdown: {
          border: "1px solid var(--kbrd-border-color)",
          backgroundColor: "var(--kbrd-color-body)",
          boxSizing: "border-box",
        },
        item: {
          padding: "var(--mantine-spacing-xs) var(--mantine-spacing-sm)",
          borderRadius: "var(--mantine-radius-xs)",
        },
      },
    }),
    Splitter: Splitter.extend({
      styles: {
        thumb: {
          backgroundColor: "var(--kbrd-color-contrast)",
        },
      },
    }),
    // Same window look as `Modal`/`Menu` above — a HoverCard is just
    // another floating window in this app, not a lighter-weight thing of
    // its own.
    HoverCard: HoverCard.extend({
      styles: {
        dropdown: {
          border: "1px solid var(--kbrd-border-color)",
          backgroundColor: "var(--kbrd-color-body)",
        },
      },
    }),
    // Mantine's own keycap look (light background, inset box-shadow, bold
    // monospace) doesn't fit this app's chrome in either theme —
    // flattened to a plain filled tag matching the rest of the UI.
    Kbd: Kbd.extend({
      styles: {
        root: {
          border: "none",
          backgroundColor: "var(--kbrd-color-surface)",
          boxShadow: "none",
          color: "var(--kbrd-color-contrast)",
          fontWeight: 400,
        },
      },
    }),
  },
});

/**
 * Mantine's own `--mantine-color-body` doesn't match what this app
 * paints via `--kbrd-color-body` (pure black in the dark theme, and its
 * own white in the light one) — most surfaces already override it
 * explicitly (see the `Modal`/`Menu` extensions above), but a few
 * effects, like `<Tabs variant="outline">`'s active-tab border, blend
 * into whatever this resolves to rather than something we can style
 * directly. Matching it per scheme fixes those for free.
 *
 * It has to be stated inside each scheme's own block rather than in the
 * shared `variables` below: Mantine's own rules target
 * `:root[data-mantine-color-scheme="dark"]`, more specific than a plain
 * `:root` and thus not overridable from there.
 */
const mantineOverrides = {
  "--mantine-color-body": "var(--kbrd-color-body)",
};

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  // The dark palette doubles as the `:root` fallback, so the app is
  // never unpainted — the scheme-specific blocks below both win over it
  // on specificity, dark included.
  variables: darkPalette,
  light: { ...lightPalette, ...mantineOverrides },
  dark: { ...darkPalette, ...mantineOverrides },
});
