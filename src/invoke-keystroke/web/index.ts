export { default as Editor } from "./Editor";
export { default as Renderer } from "../../shared/web/ActionRenderer";
export { default as manifest } from "../plugin.json";

export type KeystrokeConfig = {
  keys: string[];
  behavior: "hold" | "tap";
  durationMs: number;
};
