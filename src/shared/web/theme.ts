/**
 * Kept as the package's `@kbrd/plugins/theme` entry point, which is what
 * KBRD-WEB and Storybook both import. Everything now lives in `themes/`
 * — one file per palette (`dark.ts`, `light.ts`), the roles they answer
 * for in `palette.ts`, and the Mantine theme itself in `themes/index.ts`.
 */
export {
  cssVariablesResolver,
  darkPalette,
  lightPalette,
  theme,
  type KbrdPalette,
} from "./themes";
