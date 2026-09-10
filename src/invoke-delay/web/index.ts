export { default as LayoutEditor } from "../../shared/web/EmptyLayoutEditor";
export { default as MappingEditor } from "./MappingEditor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

/** What a delay is counted in. Stored as the unit's own symbol, not as
 * the English shortcut the panel shows for it — see `DELAY_UNITS` in
 * `Action`. */
export type DelayUnit = "ms" | "s" | "min" | "h";

export type DelayConfig = {
  // How long to wait, in `delayUnit` — always a whole number, since the
  // unit beside it is what a fraction would have been for.
  delay: number;
  delayUnit: DelayUnit;
};
