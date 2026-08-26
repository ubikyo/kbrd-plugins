export { default as Editor } from "./Editor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

import type { PlacementConfig } from "../../shared/web/Placement";

export type ImageConfig = PlacementConfig & {
  media: string;
  name: string;
  fullSize: boolean;
  size: number;
};
