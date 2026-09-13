export { default as LayoutEditor } from "./LayoutEditor";
export { default as Type, DEFAULT_KEY_MODE } from "./Type";
export { default as LayerEditor } from "../../shared/web/EmptyLayerEditor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

/** How a key behaves: active only while held, or latching until pressed
 * again. */
export type KeyMode = "momentary" | "toggle";

export type LayoutKeyConfig = {
  keyMode: KeyMode;
};
