export { default as LayoutEditor } from "./LayoutEditor";
export { default as MappingEditor } from "./MappingEditor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

import type { PositionConfig } from "../../shared/web/blocks/Position";
import type { TypographyConfig } from "../../shared/web/blocks/Typography";
import type { PlacementConfig } from "../../shared/web/Placement";

/** Kept as its own name for the renderers, which read the unit straight
 * off the config — see `Unit` in `shared/web/ux/UnitSelect`. */
export type { Unit as PositionUnit } from "../../shared/web/ux/UnitSelect";

/** A label: the text and its look (`TypographyConfig`), where it sits
 * under precise placement (`PositionConfig`), and the Layout editor's own
 * nine-way grid for when precise placement is off (`PlacementConfig`). */
export type LabelConfig = PlacementConfig & PositionConfig & TypographyConfig;
