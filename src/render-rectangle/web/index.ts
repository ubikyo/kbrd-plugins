export { default as LayoutEditor } from "./LayoutEditor";
export { default as LayerEditor } from "./LayerEditor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

import type { BackgroundConfig } from "../../shared/web/blocks/Background";
import type { BorderConfig } from "../../shared/web/blocks/Border";
import type { DimensionConfig } from "../../shared/web/blocks/Dimension";
import type { PositionConfig } from "../../shared/web/blocks/Position";
import type { PlacementConfig } from "../../shared/web/Placement";

/** A rectangle: where it sits (`PositionConfig`, or the Layout editor's
 * own nine-way grid from `PlacementConfig` while precise placement is
 * off), how big it is (`DimensionConfig`), what it's filled with
 * (`BackgroundConfig`) and what outlines it (`BorderConfig`) — the same
 * four blocks the other plugins are built from.
 *
 * `color` is what the fill was called before Background existed. Kept so
 * an instance saved then still renders the colour it was given: the
 * renderers fall back to it, and nothing writes it any more. */
export type RectangleConfig = PlacementConfig &
  PositionConfig &
  DimensionConfig &
  BackgroundConfig &
  BorderConfig & {
    color?: string;
  };
