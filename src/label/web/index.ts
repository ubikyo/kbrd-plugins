export { default as Editor } from "./Editor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

import type { PlacementConfig } from "../../shared/web/Placement";

export type LabelConfig = PlacementConfig & {
  text: string;
  size: "xs" | "sm" | "md" | "lg" | "xl";
  color: string;
  font?: string;
};
