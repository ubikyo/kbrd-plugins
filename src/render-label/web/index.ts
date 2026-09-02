export { default as LayoutEditor } from "./LayoutEditor";
export { default as MappingEditor } from "./MappingEditor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

import type { PlacementConfig } from "../../shared/web/Placement";
import type { FontSize } from "../../shared/web/fontSize";

export type LabelConfig = PlacementConfig & {
  text: string;
  size: FontSize;
  color: string;
  font?: string;
};
