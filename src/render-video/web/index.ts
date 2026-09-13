export { default as LayoutEditor } from "./LayoutEditor";
export { default as LayerEditor } from "./LayerEditor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

export type VideoConfig = {
  media: string;
  name: string;
  unconstrained?: boolean;
};
