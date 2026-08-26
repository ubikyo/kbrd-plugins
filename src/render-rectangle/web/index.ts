export { default as Editor } from "./Editor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

import type { PlacementConfig } from "../../shared/web/Placement";

export type RectangleConfig = PlacementConfig & {
  width: number;
  height: number;
  color: string;
};
