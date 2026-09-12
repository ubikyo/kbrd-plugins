/**
 * The app's Mantine theme, and the CSS custom properties every shared
 * control here reads (`--kbrd-color-body`, `--kbrd-border-color`, ...).
 *
 * It lives beside those controls rather than in KBRD-WEB, which is where
 * it started: `ux/` and `blocks/` are styled entirely in terms of these
 * variables, so anything mounting them — the app itself, and Storybook —
 * has to install the same theme or get unstyled boxes. One copy, imported
 * by both (`@kbrd/plugins/theme`), is what keeps the stories showing the
 * controls as the app actually draws them.
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
        root: { "--tabs-color": "#FFFFFF" },
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
          backgroundColor: "#FFFFFF",
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
    // monospace) doesn't fit this app's dark chrome — flattened to a plain
    // outlined tag matching the rest of the UI's borders.
    Kbd: Kbd.extend({
      styles: {
        root: {
          border: "none",
          backgroundColor: "var(--kbrd-color-surface)",
          boxShadow: "none",
          color: "#FFFFFF",
          fontWeight: 400,
        },
      },
    }),
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    "--kbrd-color-body": "#000000",
    "--kbrd-color-surface": "#222120",
    "--kbrd-border-color": "#333333",
    // What a list is ruled with inside a panel: the grid the Media
    // library is laid out on, the rules between the Inspector's plugin
    // rows, the line under each property group's header. Well under the
    // border above, which at that density reads as a cage around every
    // row rather than as lines between them — a panel's own edges and
    // anything drawn as a box in its own right keep that one.
    "--kbrd-rule-color": "#1E1E1E",
    "--kbrd-border-alt": "#FFFFFF",
    // What "this is the one" is drawn in: a selected cell's outline in
    // `<Display>`, the drop mark a reordered property lands on. The SVG
    // strokes in `LayoutCell`/`Display` still carry the literal — a
    // presentation attribute can't read a custom property — so the two
    // have to stay in step.
    "--kbrd-color-selected": "#00FF00",
  },
  light: {},
  // Mantine's own dark-7 default doesn't match the pure black this app
  // paints everywhere via `--kbrd-color-body` — most surfaces already
  // override it explicitly (see the `Modal`/`Menu` extensions above), but
  // a few effects, like `<Tabs variant="outline">`'s active-tab border,
  // blend into whatever this resolves to rather than something we can
  // style directly. Matching it here fixes those for free — it has to
  // live under `dark` rather than the shared `variables` above: Mantine's
  // own dark-scheme rule targets `:root[data-mantine-color-scheme="dark"]`,
  // more specific than a plain `:root` and thus not overridable from there.
  dark: {
    "--mantine-color-body": "var(--kbrd-color-body)",
  },
});
