export { default as LayoutEditor } from "../../shared/web/EmptyLayoutEditor";
export { default as MappingEditor } from "./MappingEditor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

import type { BorderStyleValue } from "../../shared/web/ux/Border";

/** One state's own look for the element this plugin is attached to — the
 * shape the host stores per named state (see kbrd-web's `KeyStateConfig`).
 * `backgroundColor` is optional in the same sense `borderEnabled` gates
 * the `border*` fields: absent means the property genuinely isn't set, not
 * "set to transparent". */
export type RenderKeyConfig = {
  backgroundColor?: string;
  borderEnabled: boolean;
  borderColor: string;
  borderStyle: BorderStyleValue;
  borderWidth: number;
};
