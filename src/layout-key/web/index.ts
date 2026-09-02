export { default as LayoutEditor } from "./LayoutEditor";
export { default as MappingEditor } from "../../shared/web/EmptyMappingEditor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

export type LayoutKeyConfig = {
  keyMode: "momentary" | "toggle";
};
