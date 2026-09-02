export { default as LayoutEditor } from "./LayoutEditor";
export { default as MappingEditor } from "./MappingEditor";
export { default as Renderer } from "./Renderer";
export { default as manifest } from "../plugin.json";

export type VideoConfig = {
  media: string;
  name: string;
  unconstrained?: boolean;
};
