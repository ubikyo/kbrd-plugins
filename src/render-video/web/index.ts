export { default as Editor } from "./Editor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

import type { PlacementConfig } from "../../shared/web/Placement";

export type VideoConfig = PlacementConfig & {
  media: string;
  name: string;
  fit: "contain" | "cover";
  loop: boolean;
  playCount: number;
  fullSize: boolean;
  size: number;
};
