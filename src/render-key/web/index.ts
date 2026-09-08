export { default as LayoutEditor } from "../../shared/web/EmptyLayoutEditor";
export { default as MappingEditor } from "./MappingEditor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

import type { BackgroundConfig } from "../../shared/web/blocks/Background";
import type { BorderConfig } from "../../shared/web/blocks/Border";

/** One state's own look for the element this plugin is attached to — the
 * shape the host stores per named state (see kbrd-web's `KeyStateConfig`):
 * a fill and an outline, nothing else. */
export type RenderKeyConfig = BackgroundConfig & BorderConfig;
