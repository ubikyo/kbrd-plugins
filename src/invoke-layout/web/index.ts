export { default as LayoutEditor } from "../../shared/web/EmptyLayoutEditor";
export { default as MappingEditor } from "./MappingEditor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

export type LayoutConfig = {
  layoutId: number | null;
  layerId: number | null;
  event: "down" | "up";
};
